import { Component, computed, DestroyRef, ElementRef, effect, inject, input, output, resource, signal, viewChild } from "@angular/core";
import { rxResource, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslocoPipe } from "@jsverse/transloco";
import { Article, CustomHighlights, PreviewData } from "@sinequa/atomic";
import { AppStore, CConverter, PreviewHighlights, PreviewNavigator, PreviewService, QueryService, SelectionStore } from "@sinequa/atomic-angular";
import { BreakpointObserverService, cn, ImageIcon, SpinnerIcon } from "@sinequa/ui";
import { catchError, of } from "rxjs";
import { MarkdownPipe } from "@pipes/markdown.pipe";
import { PreviewActionsComponent } from "./preview-actions";

// Delay before revealing the iframe once a scroll has been requested: lets the iframe apply and
// paint the scroll behind the overlay so the reposition is never visible. Kept below preview.js's
// ~400ms passage-highlight delay so the scroll lands first.
const REVEAL_AFTER_SCROLL_MS = 150;

// Safety-net delay used on the iframe `load` event: if the loaded content is not the instrumented
// preview (so it never emits a `ready` message), reveal it anyway so the spinner overlay cannot
// stay stuck.
const LOAD_SAFETY_NET_MS = 1500;

/**
 * Preview content component
 *
 * Usage:
 * ```html
 * <preview-content
 *    [article]="article">
 * </preview-content>
 * ```
 * Where `article` is the article to preview.
 * This component displays the preview content of the selected article inside an iframe.
 * It also includes preview actions and navigation controls.
 */
@Component({
  selector: "preview-content",
  imports: [TranslocoPipe, PreviewActionsComponent, PreviewNavigator, SpinnerIcon, ImageIcon, MarkdownPipe],
  template: `
    @if (previewDataResource.isLoading()) {
      <div class="flex h-full w-full items-center justify-center">
        <spinner-icon class="animate-spin mb-6 text-6xl text-primary" />
      </div>
    } @else if (isMarkdown()) {
      <!-- Markdown conversion: fetch the raw markdown content and render it in a div using the
           markdown pipe (markdown-it), styled via Tailwind Typography's prose, instead of
           loading it into the iframe. -->
      @if (markdownResource.isLoading()) {
        <div class="flex h-full w-full items-center justify-center">
          <spinner-icon class="animate-spin mb-6 text-6xl text-primary" />
        </div>
      } @else if (markdownResource.hasValue() && markdownResource.value()) {
        <div class="h-[calc(100%-0.5rem)] overflow-auto rounded-sm bg-background px-8 py-6 shadow-xs">
          <div class="prose max-w-none dark:prose-invert" [innerHTML]="markdownResource.value() | markdown"></div>
        </div>
      } @else {
        <div class="flex h-full w-full items-center justify-center">
          <p class="text-center text-xl">
            <image-icon class="mb-6 text-6xl text-secondary" /><br />
            {{ "previewUnavailable" | transloco }}
          </p>
        </div>
      }
    } @else if (previewValidationResource.isLoading()) {
      <div class="flex h-full w-full items-center justify-center">
        <spinner-icon class="animate-spin mb-6 text-6xl text-primary" />
      </div>
    } @else if (previewValidationResource.hasValue() && previewUrl()) {
      <div class="relative flex h-[calc(100%-0.5rem)] flex-col gap-4">
        <!-- Overlay shown while the (new) iframe content loads and is scrolled to the right page,
             so the user never sees the intermediate scroll jump. -->
        @if (!contentReady()) {
          <div class="absolute inset-0 z-20 flex items-center justify-center rounded-sm bg-background">
            <spinner-icon class="animate-spin mb-6 text-6xl text-primary" />
          </div>
        }
        <preview-navigator class="absolute top-4 left-8 inline-flex items-center rounded-md bg-muted/90 text-sm" />
        <preview-actions
          [isPrimary]="!conversion() || conversion()!.primary === true"
          [class]="cn('absolute right-4 inline-flex justify-end rounded-md dark:text-background dark:[&_button]:hover:text-foreground dark:bg-muted/10 bg-muted/90', breakpointService.isMobile() ? 'bottom-4' : 'top-4')" />
        <iframe
          #preview
          frameborder="0"
          [class]="cn('h-full grow rounded-sm bg-[#fff] shadow-xs transition-opacity', contentReady() ? 'opacity-100' : 'opacity-0')"
          [src]="previewUrl()"
          (load)="onLoaded()"></iframe>
      </div>
    } @else if (previewDataResource.hasValue() === false || (previewValidationResource.hasValue() === false && previewUrl())) {
      <div class="flex h-full w-full items-center justify-center">
        <p class="text-center text-xl">
          <image-icon class="mb-6 text-6xl text-secondary" /><br />
          {{ "previewUnavailable" | transloco }}
        </p>
      </div>
    }
  `,
  host: {
    class: "block"
  }
})
export class PreviewContentComponent {
  cn = cn;
  iframe = viewChild<ElementRef<HTMLIFrameElement>>("preview");

  breakpointService = inject(BreakpointObserverService);
  protected readonly appStore = inject(AppStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly selectionStore = inject(SelectionStore);
  private readonly previewService = inject(PreviewService);
  private readonly queryService = inject(QueryService);
  private readonly destroyRef = inject(DestroyRef);
  // Pending timer that flips `contentReady` to true; tracked so it can be cancelled when a new URL
  // starts loading or the component is destroyed, preventing a stale reveal of the wrong content.
  private revealTimer?: ReturnType<typeof setTimeout>;

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || "_query";

  conversion = input<CConverter | undefined>(undefined);
  onLoadedData = output<PreviewData | undefined>();

  /**
   * The article to be previewed.
   * @remarks
   * This input property accepts an Article object or undefined.
   * When undefined, it indicates that we use the selection store's current article.
   */
  article = input<Article | undefined>(undefined);
  protected id = computed<string | undefined>(() => {
    const id = this.article()?.id ?? this.selectionStore.id?.();
    return id;
  });
  protected previewHighlights = computed<PreviewHighlights | undefined>(() => {
    const previewHighlights = this.selectionStore.previewHighlights?.();
    return previewHighlights;
  });
  protected queryText = computed<string | undefined>(() => {
    const queryText = this.selectionStore.queryText?.();
    return queryText;
  });
  protected previewMultiConversionFlag = computed(() => this.appStore.general()?.features?.previewMultiConversion);
  protected passagePageNumber = signal<number | undefined>(undefined);
  protected currentPage = signal<string | undefined>(undefined); // used to go back to the last visited page when changing of conversion for a document
  protected contentReady = signal(false); // false while the iframe loads + scrolls, gating the spinner overlay
  protected scrollPage = computed(() =>
    this.currentPage() !== undefined ? this.currentPage() : this.passagePageNumber() !== undefined ? `sq-page-start-${this.passagePageNumber()}` : undefined
  );

  /* resources */
  public readonly previewDataResource = rxResource<PreviewData | undefined, { id: string; text: string; previewHighlights: CustomHighlights[] }>({
    params: () => {
      const id = this.id() || this.selectionStore.id?.() || "";
      const queryText = this.selectionStore.queryText?.() || "";
      const previewHighlights = this.selectionStore.previewHighlights?.() || { highlights: [] };
      return { id: id, text: queryText, previewHighlights: previewHighlights?.highlights };
    },
    defaultValue: undefined,
    stream: ({ params: { id, text, previewHighlights } }) => {
      if (id) {
        return this.previewService.preview(id, { name: this.queryName, text }, previewHighlights).pipe(
          catchError(() => {
            this.previewService.DOMContentLoaded.set(true);
            return of(undefined);
          })
        );
      }
      return of(undefined);
    }
  });

  // used to store the default preview url
  documentCachedContentUrl = computed(() => this.previewData()?.documentCachedContentUrl);
  // Effect to emit the loaded preview data when it changes
  #previewDataEffect = effect(() => {
    this.onLoadedData.emit(this.previewData());
  });

  previewData = computed(() => {
    if (this.previewDataResource.hasValue()) {
      return this.previewDataResource.value();
    }
    return undefined;
  });

  readonly previewUrl = computed(() => {
    const previewData = this.previewData();
    if (!previewData) return undefined;

    // Update the preview service with the current preview data
    this.previewService.setPreviewData(previewData);

    if (this.previewMultiConversionFlag()) {
      const url = this.conversion()?.conversion?.url ?? this.documentCachedContentUrl();
      return url ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + url) : undefined;
    } else {
      return previewData.documentCachedContentUrl
        ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + previewData.documentCachedContentUrl)
        : undefined;
    }
  });

  readonly isSecondary = computed(() => this.conversion()?.primary === false || this.conversion()?.conversion?.isPrimary === false);

  /**
   * Whether the currently selected conversion is a Markdown conversion. Only relevant when the
   * multi-conversion feature is enabled (that is the only path that exposes the converter dropdown).
   */
  readonly isMarkdown = computed(() => {
    if (!this.previewMultiConversionFlag()) return false;
    const format = this.conversion()?.format ?? this.conversion()?.conversion?.format;
    return format?.toLowerCase() === "md" || format?.toLowerCase() === "markdown";
  });

  /** Same-origin URL of the raw markdown content to fetch, or undefined when not a Markdown conversion. */
  private readonly markdownContentUrl = computed(() => {
    if (!this.isMarkdown()) return undefined;
    const url = this.conversion()?.conversion?.url;
    return url ? window.location.origin + url : undefined;
  });

  /**
   * Fetches the raw markdown text for a Markdown conversion so it can be rendered as HTML via the
   * `markdown` pipe, rather than being displayed as unformatted text inside the iframe.
   */
  public readonly markdownResource = resource<string | undefined, { url: string | undefined }>({
    params: () => ({ url: this.markdownContentUrl() }),
    defaultValue: undefined,
    loader: async ({ params, abortSignal }) => {
      if (!params.url) return undefined;
      const response = await fetch(params.url, { signal: abortSignal });
      if (!response.ok) throw new Error(`Failed to fetch markdown content (status ${response.status})`);
      return await response.text();
    }
  });

  /**
   * A resource that validates the preview content by checking if the cached document URL is accessible.
   *
   * @remarks
   * This resource performs a HEAD request to verify that the cached content exists and is accessible.
   * The validation depends on both the preview URL and the document cached content URL being available.
   *
   * @returns An object with an `isValid` boolean property indicating whether the preview content is accessible,
   * or `undefined` if an error occurs during the fetch operation.
   *
   * When the fetch fails, it sets the `DOMContentLoaded` signal to `true` on the preview service before returning undefined.
   */
  previewValidationResource = resource({
    params: () => ({ url: this.previewUrl(), previewData: this.previewData() }),
    defaultValue: undefined,
    loader: async ({ params }) => {
      try {
        if (!params.url || !params.previewData?.documentCachedContentUrl) {
          throw new Error("Invalid parameters for preview validation");
        }

        const response = await fetch(window.location.origin + params.previewData.documentCachedContentUrl, {
          method: "HEAD"
        });
        return { isValid: response.status === 200 };
      } catch {
        // In case of an error during fetch, we consider the preview as invalid
        // and stop the loading indicator.
        this.previewService.DOMContentLoaded.set(true);
        return undefined;
      }
    }
  });

  constructor() {
    // Set the iframe's contentWindow in the preview service when the iframe is available
    // the iframe is available when the canLoadIframe signal is true
    effect(() => {
      const iframeElement = this.iframe();
      if (!iframeElement) return;

      this.previewService.setIframe(iframeElement.nativeElement.contentWindow);
    });

    effect(() => {
      if (this.id()) {
        this.currentPage.set(undefined);
        this.passagePageNumber.set(undefined); // resetting the page number if we change of selected document
      }
    });

    effect(() => {
      // A new conversion / preview URL is loading: hide the content behind the spinner overlay
      // until the fresh iframe has loaded and been scrolled to the right page. Cancelling any
      // pending reveal here prevents a stale timer from the previous URL revealing the new,
      // not-yet-scrolled content too early.
      this.previewUrl();
      this.hideContent();
    });

    const controller = new AbortController();

    window.addEventListener(
      "message",
      (event: MessageEvent) => {
        // Only react to messages emitted by this component's own iframe. Several preview-content
        // instances (and other iframes) can share this window; without this guard another iframe's
        // `ready`/`current-page` message would reveal or scroll the wrong preview.
        const iframeWindow = this.iframe()?.nativeElement.contentWindow;
        if (!iframeWindow || event.source !== iframeWindow) return;

        const message = event.data;
        if (message.type === "current-page") {
          this.currentPage.set(message.data);
        } else if (message.type === "ready") {
          // The iframe has finished its layout (zoom-fit, sizing). Now it is safe to
          // scroll to the target page and then reveal the content.
          this.onPreviewReady();
        }
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => {
      controller.abort();
      clearTimeout(this.revealTimer);
      const id = this.id();
      if (id) {
        this.previewDataResource.destroy();
        this.previewService.close(id, { name: this.queryName });
      }
    });
  }

  /**
   * Handles the iframe `load` event.
   *
   * The scrolling itself is driven by the iframe's `ready` message (see {@link onPreviewReady}),
   * which fires only once the iframe has finished laying out its content. This handler is only a
   * safety net: if the loaded content is not the instrumented preview (so it never emits `ready`),
   * reveal it anyway after a short delay so the spinner overlay cannot stay stuck.
   */
  onLoaded() {
    this.revealContent(LOAD_SAFETY_NET_MS);
  }

  /**
   * Handles the iframe `ready` message, emitted once the iframe content is fully laid out.
   *
   * Scrolls to the relevant location, then reveals the content:
   * - If the user has since manually scrolled to a different page (`currentPage`), that page wins
   *   over re-selecting the original passage snippet, since the passage reference is no longer the
   *   relevant location once the user navigated away from it.
   * - Otherwise, if a `snippetId` is available on a primary conversion, select that snippet.
   * - On a secondary conversion, scroll to the cached page or resolve the selected passage's page.
   * - Otherwise there is nothing to scroll to, so reveal immediately.
   */
  private onPreviewReady() {
    const previewHighlights = this.selectionStore.previewHighlights?.();
    if (this.currentPage() !== undefined) {
      this.scrollToPage();
      this.revealContent();
    } else if (previewHighlights?.snippetId !== undefined && !this.isSecondary()) {
      const message = { action: "select", id: `snippet_${previewHighlights.snippetId}`, usePassageHighlighter: true };
      this.previewService.sendMessage(message);
      this.revealContent();
    } else if (this.isSecondary() && this.scrollPage() !== undefined) {
      this.scrollToPage();
      this.revealContent();
    } else if (this.isSecondary()) {
      // The passage's page is not known yet: resolve it, then scroll and reveal (in the callback).
      this.getPassagePage();
    } else {
      // Nothing to scroll to (e.g. a fresh primary document): show the content right away.
      this.revealContent(0);
    }
  }

  /**
   * Reveals the iframe content, cancelling any pending reveal first so a stale timer from a
   * previous load cannot reveal the next document before it has been scrolled.
   *
   * @param delayMs delay before revealing. A small delay lets the iframe apply a just-requested
   *   scroll behind the overlay; `0` reveals synchronously (nothing to wait for).
   */
  private revealContent(delayMs: number = REVEAL_AFTER_SCROLL_MS): void {
    clearTimeout(this.revealTimer);
    if (delayMs <= 0) {
      this.contentReady.set(true);
      return;
    }
    this.revealTimer = setTimeout(() => this.contentReady.set(true), delayMs);
  }

  /**
   * Hides the iframe content behind the spinner overlay and cancels any pending reveal, so a new
   * document / conversion always starts hidden until it has been scrolled into position.
   */
  private hideContent(): void {
    clearTimeout(this.revealTimer);
    this.contentReady.set(false);
  }

  /**
   * Get the page of the stored passage offset in order to scroll to it
   */
  getPassagePage(): void {
    const { id, offset, length } = this.previewService.passageOffset() || {};
    if (id === undefined || offset === undefined || length === undefined) {
      // No passage to scroll to: reveal the content as-is.
      this.revealContent(0);
      return;
    }

    this.queryService
      .getDocPage(id, offset, length)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pageNumber: number) => {
        this.passagePageNumber.set(pageNumber);
        this.scrollToPage();
        this.revealContent();
      });
  }

  /**
   * Scroll to the stored page number
   */
  scrollToPage(): void {
    if (this.scrollPage() === undefined) return;
    this.previewService.events.set("scrollTo");
    this.previewService.sendMessage({ action: "select", id: this.scrollPage(), usePassageHighlighter: false });
  }
}

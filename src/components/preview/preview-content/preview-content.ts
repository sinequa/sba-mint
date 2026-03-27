import { Component, computed, DestroyRef, effect, ElementRef, inject, input, output, resource, signal, viewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslocoPipe } from "@jsverse/transloco";

import { Article, CustomHighlights, PreviewData } from "@sinequa/atomic";
import { AppStore, CConverter, PreviewHighlights, PreviewNavigator, PreviewService, QueryService, SelectionStore } from "@sinequa/atomic-angular";

import { rxResource, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BreakpointObserverService, cn } from "@sinequa/ui";
import { catchError, of } from "rxjs";
import { PreviewActionsComponent } from "./preview-actions";

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
  imports: [TranslocoPipe, PreviewActionsComponent, PreviewNavigator],
  template: `
    @if (previewDataResource.isLoading() || previewValidationResource.isLoading()) {
      <div class="flex h-full w-full items-center justify-center">
        <i class="fa-fw far fa-spinner fa-spin mb-6 text-6xl text-primary"></i>
      </div>
    } @else if (previewValidationResource.hasValue() && previewUrl()) {
      <div class="relative flex h-[calc(100%-0.5rem)] flex-col gap-4">
        <preview-navigator class="absolute top-4 left-8 inline-flex items-center rounded-md bg-muted/90 text-sm" />
        <preview-actions
          [isPrimary]="!conversion() || conversion()!.primary === true"
          [class]="cn('absolute right-4 inline-flex justify-end rounded-md bg-muted/90', breakpointService.isMobile() ? 'bottom-4' : 'top-4')" />
        <iframe #preview frameborder="0" class="h-full grow rounded-sm bg-[#ffff] shadow-xs" [src]="previewUrl()" (load)="onLoaded()"></iframe>
      </div>
    } @else if (previewDataResource.hasValue() === false || (previewValidationResource.hasValue() === false && previewUrl())) {
      <div class="flex h-full w-full items-center justify-center">
        <p class="text-center text-xl">
          <i class="fa-fw far fa-image mb-6 text-6xl text-secondary"></i><br />
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
  protected scrollPage = computed(() => this.currentPage() !== undefined ? this.currentPage() : (this.passagePageNumber() !== undefined ? `sq-page-start-${this.passagePageNumber()}` : undefined));

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
      if (this.scrollPage() !== undefined) { // if already a page to scroll to, trigger scrolling
        this.scrollToPage();
      } else if (this.previewUrl() && this.isSecondary()) { // if secondary document, scroll to clicked passage if any (checked in method)
        this.getPassagePage();
      }
    });

    const controller = new AbortController();

    window.addEventListener(
      "message",
      (event: MessageEvent) => {
        const message = event.data;
        if (message.type === "current-page") {
          this.currentPage.set(message.data);
        }
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => {
      controller.abort();
      const id = this.id();
      if (id) {
        this.previewDataResource.destroy();
        this.previewService.close(id, { name: this.queryName });
      }
    });
  }

  /**
   * Handles the event when the preview component is loaded.
   *
   * This method retrieves the `previewHighlights` from the selection store state.
   * If `previewHighlights` contains a `snippetId`, it constructs a message with
   * the action 'select', the snippet ID, and a flag to use the passage highlighter.
   * The message is then sent to the preview service.
   */
  onLoaded() {
    const previewHighlights = this.selectionStore.previewHighlights?.();
    if (previewHighlights?.snippetId !== undefined && !this.isSecondary()) {
      const message = { action: "select", id: `snippet_${previewHighlights.snippetId}`, usePassageHighlighter: true };
      this.previewService.sendMessage(message);
    } else if (this.isSecondary() && this.scrollPage() !== undefined) {
      this.scrollToPage();
    }

    // this.previewService.getPageInfo();
  }

  /**
   * Get the page of the stored passage offset in order to scroll to it
   */
  getPassagePage(): void {
    const { id, offset, length } = this.previewService.passageOffset() || {};
    if (id === undefined || offset === undefined || length === undefined) return;

    this.queryService
      .getDocPage(id, offset, length)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pageNumber: number) => {
        this.passagePageNumber.set(pageNumber);
        this.scrollToPage();
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

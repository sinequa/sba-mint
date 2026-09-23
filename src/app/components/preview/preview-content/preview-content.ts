import { Component, computed, DestroyRef, effect, ElementRef, inject, input, resource, signal, viewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslocoPipe } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { Article, CustomHighlights, PreviewData } from "@sinequa/atomic";
import { AppStore, PreviewHighlights, PreviewNavigator, PreviewService, QueryParamsStore, SelectionStore } from "@sinequa/atomic-angular";

import { rxResource } from "@angular/core/rxjs-interop";
import { BreakpointObserverService, cn, ImageIcon, SpinnerIcon } from "@sinequa/ui";
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
  imports: [TranslocoPipe, PreviewActionsComponent, PreviewNavigator, SpinnerIcon, ImageIcon],
  template: `
    @if (previewDataResource.isLoading() || previewValidationResource.isLoading()) {
      <div class="flex h-full w-full items-center justify-center">
        <spinner-icon class="animate-spin mb-6 text-6xl text-primary" />
      </div>
    } @else if (previewValidationResource.hasValue() && previewUrl()) {
      <div class="relative flex h-[calc(100%-0.5rem)] flex-col gap-4">
        <preview-navigator class="absolute top-4 left-8 inline-flex items-center rounded-md bg-muted/90 text-sm" />
        <preview-actions
          [aiDescriptionShown]="aiDescriptionShown()"
          [class]="cn('absolute right-4 inline-flex justify-end rounded-md bg-muted/90', breakpointService.isMobile() ? 'bottom-4' : 'top-4')" />
        <iframe #preview frameborder="0" class="h-full grow rounded-sm bg-[#ffff] shadow-xs" [src]="previewUrl()" (load)="onLoaded()"></iframe>
      </div>
    } @else if (previewDataResource.hasValue() === false || (previewValidationResource.hasValue() === false && previewUrl())) {
      <div class="flex h-full w-full items-center justify-center">
        <p class="text-center text-xl">
          <image-icon class="mb-6 text-6xl text-secondary" /><br />
          {{ 'previewUnavailable' | transloco }}
        </p>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `
  ]
})
export class PreviewContentComponent {
  cn = cn;
  iframe = viewChild<ElementRef<HTMLIFrameElement>>("preview");

  breakpointService = inject(BreakpointObserverService);
  protected readonly appStore = inject(AppStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly selectionStore = inject(SelectionStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly previewService = inject(PreviewService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * The query the preview has to be resolved against, which is not always the default one. Kept in
   * step with the component of the same name under `src/components`, which is the one the
   * application bootstraps; see it for why `?n=` has to be followed and why `_query` is not a
   * fallback worth having.
   */
  private currentQueryName(): string | undefined {
    return this.queryParamsStore.getQuery().name || this.appStore.getDefaultQuery()?.name;
  }

  /**
   * The article to be previewed.
   * @remarks
   * This input property accepts an Article object or undefined.
   * When undefined, it indicates that we use the selection store's current article.
   */
  article = input<Article | undefined>(undefined);
  protected id = computed<string | undefined>(() => {
    const { id } = this.article() || getState(this.selectionStore);
    return id;
  });
  protected previewHighlights = computed<PreviewHighlights | undefined>(() => {
    const { previewHighlights } = getState(this.selectionStore);
    return previewHighlights;
  });
  protected queryText = computed<string | undefined>(() => {
    const { queryText } = getState(this.selectionStore);
    return queryText;
  });
  /**
   * Set when the iframe reveals an AI page description on its own, because the
   * cited passage lives inside it (multimodal conversions hide those blocks by
   * default). Forwarded to `<preview-actions>` so its toggle reflects the state.
   */
  protected aiDescriptionShown = signal(false);

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
        return this.previewService.preview(id, { name: this.currentQueryName(), text }, previewHighlights).pipe(
          catchError(() => {
            this.previewService.DOMContentLoaded.set(true);
            return of(undefined);
          })
        );
      }
      return of(undefined);
    }
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

    return previewData.documentCachedContentUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + previewData.documentCachedContentUrl)
      : undefined;
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

        const response = await fetch(window.location.origin + params.previewData.documentCachedContentUrl, { method: "HEAD" });
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
      // A fresh document starts with its AI descriptions hidden again.
      this.previewUrl();
      this.aiDescriptionShown.set(false);
    });

    const controller = new AbortController();

    window.addEventListener(
      "message",
      (event: MessageEvent) => {
        // The iframe reveals a hidden AI description by itself when the cited passage lives
        // inside it, and says so, so that the actions toggle does not contradict the screen.
        if (event.data?.type === "description-visible") {
          this.aiDescriptionShown.set(true);
        }
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => {
      controller.abort();

      const id = this.id();
      if (id) {
        this.previewDataResource.destroy();
        this.previewService.close(id, { name: this.currentQueryName() });
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
    const { previewHighlights } = getState(this.selectionStore);
    if (previewHighlights?.snippetId !== undefined) {
      const message = { action: "select", id: `snippet_${previewHighlights.snippetId}`, usePassageHighlighter: true };
      this.previewService.sendMessage(message);
    }

    // this.previewService.getPageInfo();
  }
}

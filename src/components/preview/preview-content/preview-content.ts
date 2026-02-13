import { Component, computed, DestroyRef, effect, ElementRef, inject, input, output, resource, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article, CustomHighlights, PreviewData } from '@sinequa/atomic';
import { AppStore, CConverter, PreviewHighlights, PreviewNavigator, PreviewService, SelectionStore } from '@sinequa/atomic-angular';

import { rxResource } from '@angular/core/rxjs-interop';
import { BreakpointObserverService, cn } from '@sinequa/ui';
import { catchError, of } from 'rxjs';
import { PreviewActionsComponent } from './preview-actions';

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
  selector: 'preview-content',
  imports: [TranslocoPipe, PreviewActionsComponent, PreviewNavigator],
  template: `
    @if (previewDataResource.isLoading() || previewValidationResource.isLoading()) {
      <div class="flex h-full w-full items-center justify-center">
        <i class="fa-fw far fa-spinner fa-spin text-primary mb-6 text-6xl"></i>
      </div>
    } @else if (previewValidationResource.hasValue() && previewUrl()) {
      <div class="relative flex h-[calc(100%_-_0.5rem)] flex-col gap-4">
        <preview-navigator class="bg-muted/90 absolute top-4 left-8 inline-flex items-center rounded-md text-sm" />
        <preview-actions
          [isPrimary]="!conversion() || conversion()!.primary === true"
          [class]="cn('bg-muted/90 absolute right-4 inline-flex justify-end rounded-md', breakpointService.isMobile() ? 'bottom-4' : 'top-4')" />
        <iframe #preview frameborder="0" class="h-full flex-grow rounded-sm bg-[#ffff] shadow-xs" [src]="previewUrl()" (load)="onLoaded()"></iframe>
      </div>
    } @else if (previewDataResource.hasValue() === false || (previewValidationResource.hasValue() === false && previewUrl())) {
      <div class="flex h-full w-full items-center justify-center">
        <p class="text-center text-xl">
          <i class="fa-fw far fa-image text-secondary mb-6 text-6xl"></i><br />
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
  iframe = viewChild<ElementRef<HTMLIFrameElement>>('preview');

  breakpointService = inject(BreakpointObserverService);
  protected readonly appStore = inject(AppStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly selectionStore = inject(SelectionStore);
  private readonly previewService = inject(PreviewService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || '_query';

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
  protected previewMultiConversion = computed(() => this.appStore.general()?.features?.previewMultiConversion);

  /* resources */
  public readonly previewDataResource = rxResource<PreviewData | undefined, { id: string; text: string; previewHighlights: CustomHighlights[] }>({
    params: () => {
      const id = this.id() || getState(this.selectionStore).id || '';
      const { queryText = '', previewHighlights = { highlights: [] } } = getState(this.selectionStore);
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

  documentCachedContentUrl?: string; // used to store the default preview url
  previewData = computed(() => {
    if (this.previewDataResource.hasValue()) {
      const previewData = this.previewDataResource.value();
      if (!this.documentCachedContentUrl && previewData?.documentCachedContentUrl) this.documentCachedContentUrl = previewData.documentCachedContentUrl;
      this.onLoadedData.emit(previewData);
      return previewData;
    }
    this.onLoadedData.emit(undefined);
    return undefined;
  });

  readonly previewUrl = computed(() => {
    const previewData = this.previewData();
    if (!previewData) return undefined;

    // Update the preview service with the current preview data
    this.previewService.setPreviewData(previewData);

    let url = this.previewMultiConversion() && !!this.conversion()?.conversion?.url ? this.conversion()!.conversion!.url : this.documentCachedContentUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + url) : undefined;
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
          throw new Error('Invalid parameters for preview validation');
        }

        const response = await fetch(window.location.origin + params.previewData.documentCachedContentUrl, { method: 'HEAD' });
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

    this.destroyRef.onDestroy(() => {
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
    const { previewHighlights } = getState(this.selectionStore);
    if (previewHighlights?.snippetId !== undefined) {
      const message = { action: 'select', id: `snippet_${previewHighlights.snippetId}`, usePassageHighlighter: true };
      this.previewService.sendMessage(message);
    }

    // this.previewService.getPageInfo();
  }
}

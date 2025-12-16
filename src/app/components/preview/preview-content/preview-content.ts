import { Component, computed, DestroyRef, effect, ElementRef, inject, resource, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { CustomHighlights, PreviewData } from '@sinequa/atomic';
import { AppStore, PreviewHighlights, PreviewNavigator, PreviewService, SelectionStore } from '@sinequa/atomic-angular';

import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { PreviewActionsComponent } from './actions';

@Component({
  selector: 'preview-content',
  imports: [TranslocoPipe, PreviewActionsComponent, PreviewNavigator],
  template: `
    @if (canLoadIframe()) {
      <section class="relative flex h-full flex-col gap-4">
        <preview-navigator class="bg-muted/90 absolute top-4 left-8 inline-flex items-center rounded-md text-sm" />
        <preview-actions class="absolute top-4 right-8 inline-flex justify-end rounded-md" />
        <iframe #preview frameborder="0" class="h-full flex-grow rounded-sm bg-[#ffff] shadow-xs" [src]="previewUrl()" (load)="onLoaded()"></iframe>
      </section>
    } @else if (previewUrlError()) {
      <section class="flex h-full w-full items-center justify-center">
        <p class="text-center text-xl">
          <i class="fa-fw far fa-image text-secondary mb-6 text-6xl"></i><br />
          {{ 'previewUnavailable' | transloco }}
        </p>
      </section>
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
  iframe = viewChild<ElementRef<HTMLIFrameElement>>('preview');

  protected readonly appStore = inject(AppStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly selectionStore = inject(SelectionStore);
  private readonly previewService = inject(PreviewService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || '_query';

  protected id = computed<string | undefined>(() => {
    const { id } = getState(this.selectionStore);
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

  /* resources */
  public readonly previewDataResource = rxResource<PreviewData, { id: string; text: string; previewHighlights: CustomHighlights[] }>({
    params: () => {
      const { id = '', queryText = '', previewHighlights = { highlights: [] } } = getState(this.selectionStore);
      return { id: id, text: queryText, previewHighlights: previewHighlights?.highlights };
    },
    defaultValue: {} as PreviewData,
    stream: ({ params: { id, text, previewHighlights } }) => {
      if (id) {
        return this.previewService.preview(id, { name: this.queryName, text }, previewHighlights).pipe(
          catchError(() => {
            this.previewService.DOMContentLoaded.set(true);
            return of({} as PreviewData);
          })
        );
      }
      return of({} as PreviewData);
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

  previewValidationResource = resource({
    params: () => ({ url: this.previewUrl(), previewData: this.previewData() }),
    defaultValue: { isValid: false },
    loader: async ({ params }) => {
      if (!params.url || !params.previewData?.documentCachedContentUrl) {
        return { isValid: false };
      }

      try {
        const response = await fetch(window.location.origin + params.previewData.documentCachedContentUrl, { method: 'HEAD' });
        return { isValid: response.status === 200 };
      } catch {
        this.previewService.DOMContentLoaded.set(true);
        return { isValid: false };
      }
    }
  });

  canLoadIframe = computed(() => {
    if (this.previewValidationResource.hasValue() === false) {
      return false;
    }

    const validation = this.previewValidationResource.value();
    const value = validation?.isValid ?? false;
    return value;
  });

  previewUrlError = computed(() => !this.canLoadIframe());

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

import { ChangeDetectorRef, Component, computed, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { PreviewNavigator, PreviewService, SelectionStore } from '@sinequa/atomic-angular';
import { PreviewData } from '@sinequa/atomic';

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

  previewData = input.required<PreviewData>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly selectionStore = inject(SelectionStore);
  private readonly previewService = inject(PreviewService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly canLoadIframe = signal<boolean>(true);
  readonly previewUrlError = signal<boolean>(false);

  readonly previewUrl = computed(() =>
    this.previewData()?.documentCachedContentUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this.previewData().documentCachedContentUrl)
      : undefined
  );

  constructor() {
    effect(() => {
      if (!this.iframe()) return;

      this.previewService.setIframe(this.iframe()!.nativeElement.contentWindow);
    });

    effect(() => {
      if (!this.previewData()) return;
      this.previewService.setPreviewData(this.previewData());
    });

    effect(async () => {
      if (!this.previewUrl()) {
        this.canLoadIframe.set(false);
        return;
      }

      try {
        // check if the document is accessible
        const response = await fetch(window.location.origin + this.previewData().documentCachedContentUrl, { method: 'HEAD' });
        this.canLoadIframe.set(response.status === 200);
        this.previewUrlError.set(response.status !== 200);
      } catch (e) {
        this.canLoadIframe.set(false);
        this.previewUrlError.set(true);
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
      const message: any = { action: 'select', id: `snippet_${previewHighlights!.snippetId}`, usePassageHighlighter: true };
      this.previewService.sendMessage(message);
    }

    // this.previewService.getPageInfo();
  }
}

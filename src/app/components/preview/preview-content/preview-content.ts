import { ChangeDetectorRef, Component, computed, effect, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { PreviewData } from '@sinequa/atomic';
import { PreviewService, SelectionStore } from '@sinequa/atomic-angular';
import { PreviewActionsComponent } from './actions';

@Component({
  selector: 'preview-content',
  standalone: true,
  imports: [TranslocoPipe, PreviewActionsComponent],
  template: `
    <!-- Use hidden and absolute positioning -->
    @if (canLoadIframe()) {
      <section class="flex h-full flex-col gap-4">
        <preview-actions class="flex justify-end" />

        <iframe
          #preview
          frameborder="0"
          class="h-full flex-grow rounded-sm bg-white shadow-xs"
          [src]="previewUrl()"
          (load)="onLoaded()"
          title="{{ 'preview.documentPreview' | transloco }}"
          [attr.aria-label]="'preview.documentPreview' | transloco"></iframe>
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

  readonly canLoadIframe = signal<boolean>(false);
  readonly previewUrlError = signal<boolean>(false);

  readonly previewUrl = computed(() =>
    this.previewData()?.documentCachedContentUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this.previewData().documentCachedContentUrl)
      : undefined
  );

  readonly loading = model<boolean>(false);

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
      if (!this.previewUrl()) return;

      try {
        this.loading.set(true);
        this.cdr.detectChanges();
        const response = await fetch(window.location.origin + this.previewData().documentCachedContentUrl);
        this.canLoadIframe.set(response.status === 200);
        this.previewUrlError.set(response.status !== 200);
      } catch (e) {
        this.canLoadIframe.set(false);
        this.previewUrlError.set(true);
      } finally {
        this.loading.set(false);
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
    this.loading.set(false);
  }
}

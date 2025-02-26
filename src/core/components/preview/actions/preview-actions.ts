import { Component, DestroyRef, inject, signal } from '@angular/core';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import { ButtonComponent, PreviewService } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`../i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'preview-actions',
  standalone: true,
  imports: [TranslocoPipe, ButtonComponent],
  providers: [provideTranslocoScope({ scope: 'preview', loader })],
  template: `
    <button variant="icon" class="size-6" [attr.title]="'preview.zoomIn' | transloco" (click)="zoomIn()">
      <i class="fa-regular fa-magnifying-glass-plus shrink-0"></i>
    </button>

    <button variant="icon" class="size-6" [attr.title]="'preview.zoomOut' | transloco" (click)="zoomOut()">
      <i class="fa-regular fa-magnifying-glass-minus shrink-0"></i>
    </button>

    @if (extracts()) {
      <button variant="icon" class="size-6" [attr.title]="'preview.toggleExtracts' | transloco" (click)="toggleExtracts()">
        <i class="fa-regular fa-flashlight shrink-0"></i>
      </button>
    } @else {
      <button variant="icon" class="size-6" [attr.title]="'preview.toggleExtracts' | transloco" (click)="toggleExtracts()">
        <span class="fa-stack shrink-0 items-center justify-center">
          <i class="fa-regular fa-flashlight fa-stack-1x"></i>
          <i class="fa-regular fa-slash fa-stack-1x"></i>
        </span>
      </button>
    }

    @if (entities()) {
      <button variant="icon" class="size-6" [attr.title]="'preview.toggleEntities' | transloco" (click)="toggleEntities()">
        <i class="fa-regular fa-lightbulb shrink-0"></i>
      </button>
    } @else {
      <button variant="icon" class="size-6" [attr.title]="'preview.toggleEntities' | transloco" (click)="toggleEntities()">
        <i class="fa-regular fa-lightbulb-slash shrink-0"></i>
      </button>
    }
  `
})
export class PreviewActionsComponent {
  protected readonly extracts = signal(true);
  protected readonly entities = signal(false);

  private readonly previewService = inject(PreviewService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const controller = new AbortController();

    window.addEventListener(
      'message',
      (event: MessageEvent) => {
        const message = event.data;
        if (message.type === 'selected-position') {
          this.previewService.toggle(this.extracts(), this.entities());
        }

        if (message.type === 'ready') {
          this.previewService.toggle(this.extracts(), this.entities());
        }
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => controller.abort());
  }

  public zoomIn(): void {
    this.previewService.zoomIn();
  }

  public zoomOut(): void {
    this.previewService.zoomOut();
  }

  toggleExtracts() {
    const value = !this.extracts();
    this.extracts.set(value);
    if (value === true) {
      this.entities.set(false);
    }
    this.previewService.toggle(this.extracts(), this.entities());
    this.previewService.sendMessage({ action: 'unselect' });
  }

  toggleEntities() {
    const value = !this.entities();
    this.entities.set(value);
    if (value === true) {
      this.extracts.set(false);
    }
    this.previewService.toggle(this.extracts(), this.entities());
    this.previewService.sendMessage({ action: 'unselect' });
  }
}

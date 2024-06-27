import { Component, inject, signal } from "@angular/core";
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from "@jsverse/transloco";

import { PreviewService } from "@sinequa/atomic-angular";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: "preview-actions",
  standalone: true,
  imports: [TranslocoPipe],
  providers: [provideTranslocoScope({ scope: "preview", loader })],
  template: `
    <button
      class="flex justify-center items-center btn btn-secondary p-1 size-6"
      [attr.title]="'preview.zoomIn' | transloco"
      (click)="zoomIn()"
    >
      <i class="fa-regular fa-magnifying-glass-plus"></i>
    </button>
    
    <button
      class="flex justify-center items-center btn btn-secondary p-1 size-6"
      [attr.title]="'preview.zoomOut' | transloco"
      (click)="zoomOut()"
    >
      <i class="fa-regular fa-magnifying-glass-minus"></i>
    </button>
    
    <button
      class="flex justify-center items-center btn btn-secondary p-1 size-6"
      [attr.title]="'preview.toggleExtracts' | transloco"
      (click)="toggleExtracts()"
    >
      @if (extracts()) {
        <span class="fa-stack justify-center items-center">
          <i class="fa-regular fa-flashlight fa-stack-1x"></i>
          <i class="fa-regular fa-slash fa-stack-1x"></i>
        </span>
      }

      @else {
        <i class="fa-regular fa-flashlight"></i>
      }
    </button>

    <button
      class="flex justify-center items-center btn btn-secondary p-1 size-6"
      [attr.title]="'preview.toggleEntities' | transloco"
      (click)="toggleEntities()"
    >
      @if (entities()) {
        <i class="fa-regular fa-lightbulb"></i>
      }

      @else {
        <i class="fa-regular fa-lightbulb-slash"></i>
      }
    </button>
  `,
})
export class PreviewActionsComponent {
  protected readonly extracts = signal(true);
  protected readonly entities = signal(true);

  private readonly previewService = inject(PreviewService);

  public zoomIn(): void {
    this.previewService.zoomIn();
  }

  public zoomOut(): void {
    this.previewService.zoomOut();
  }

  public toggleExtracts(): void {
    this.extracts.set(!this.extracts());
    this.previewService.toggle(this.extracts(), this.entities());
  }

  public toggleEntities(): void {
    this.entities.set(!this.entities());
    this.previewService.toggle(this.extracts(), this.entities());
  }
}
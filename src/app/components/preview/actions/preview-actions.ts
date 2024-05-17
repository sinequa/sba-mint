import { PreviewService } from "@/app/services/preview";
import { Component, inject, signal } from "@angular/core";

@Component({
  selector: "preview-actions",
  standalone: true,
  template: `
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="zoomIn()">
        <i class="fa-regular fa-magnifying-glass-plus"></i>
      </button>
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="zoomOut()">
        <i class="fa-regular fa-magnifying-glass-minus"></i>
      </button>
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="toggleExtracts()">
        @if(extracts()) {
          <span class="fa-stack justify-center items-center">
            <i class="fa-regular fa-flashlight fa-stack-1x"></i>
            <i class="fa-regular fa-slash fa-stack-1x"></i>
          </span>
        }
        @else {
          <i class="fa-regular fa-flashlight"></i>
        }
      </button>
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="toggleEntities()">
        @if(entities()) {
          <i class="fa-regular fa-lightbulb"></i>
        }
        @else {
          <i class="fa-regular fa-lightbulb-slash"></i>
        }
      </button>
  `,
})
export class PreviewActionsComponent {
  extracts = signal(true);
  entities = signal(true);

  readonly previewService = inject(PreviewService);

  zoomIn() {
    this.previewService.zoomIn();
  }

  zoomOut() {
    this.previewService.zoomOut();
  }

  toggleExtracts() {
    this.extracts.set(!this.extracts());
    this.previewService.toggle(this.extracts(), this.entities());
  }

  toggleEntities() {
    this.entities.set(!this.entities());
    this.previewService.toggle(this.extracts(), this.entities());
  }
}
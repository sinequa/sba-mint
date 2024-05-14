import { PreviewService } from "@/app/services/preview";
import { Component, inject, signal } from "@angular/core";

@Component({
  selector: "preview-actions",
  standalone: true,
  template: `
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="zoomIn()">
        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
      </button>
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="zoomOut()">
        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
      </button>
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="toggleExtracts()">
        @if(extracts()) {
          <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4"/><path d="M7 2h11v4c0 2-2 2-2 4v1"/><line x1="11" x2="18" y1="6" y2="6"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
        }
        @else {
          <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z"/><line x1="6" x2="18" y1="6" y2="6"/><line x1="12" x2="12" y1="12" y2="12"/></svg>
        }
      </button>
      <button class="flex justify-center items-center btn btn-secondary p-1 size-6"
        (click)="toggleEntities()">
        @if(entities()) {
          <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5"/><path d="m2 2 20 20"/><path d="M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        }
        @else {
          <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
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
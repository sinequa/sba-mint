import { Component, DestroyRef, effect, inject, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { PreviewService, SelectionStore } from "@sinequa/atomic-angular";
import { ButtonComponent } from "@sinequa/ui";

@Component({
  selector: "preview-actions",
  imports: [TranslocoPipe, ButtonComponent],
  template: `
    <button variant="ghost" class="dark:hover:bg-background/10 dark:text-white" size="icon" [attr.title]="'preview.zoomFit' | transloco" (click)="zoomFit()">
      <i class="fa-regular fa-arrows-maximize shrink-0"></i>
    </button>

    <button variant="ghost" class="dark:hover:bg-background/10 dark:text-white" size="icon" [attr.title]="'preview.zoomIn' | transloco" (click)="zoomIn()">
      <i class="fa-regular fa-magnifying-glass-plus shrink-0"></i>
    </button>

    <button variant="ghost" class="dark:hover:bg-background/10 dark:text-white" size="icon" [attr.title]="'preview.zoomOut' | transloco" (click)="zoomOut()">
      <i class="fa-regular fa-magnifying-glass-minus shrink-0"></i>
    </button>

    @if (hasAIDescription()) {
      @if (showAIDescription()) {
        <button
          variant="ghost"
          class="dark:hover:bg-background/10 dark:text-white"
          size="icon"
          [attr.title]="'preview.toggleAIDescription' | transloco"
          (click)="toggleAIDescription()">
          <i class="fa-regular fa-sparkles shrink-0"></i>
        </button>
      } @else {
        <button
          variant="ghost"
          size="icon"
          class="dark:hover:bg-background/10 dark:text-white"
          [attr.title]="'preview.toggleAIDescription' | transloco"
          (click)="toggleAIDescription()">
          <span class="fa-stack shrink-0 items-center justify-center">
            <i class="fa-regular fa-sparkles fa-stack-1x"></i>
            <i class="fa-regular fa-slash fa-stack-1x"></i>
          </span>
        </button>
      }
    }

    @if (extracts()) {
      <button
        variant="ghost"
        class="dark:hover:bg-background/10 dark:text-white"
        size="icon"
        [attr.title]="'preview.toggleExtracts' | transloco"
        (click)="toggleExtracts()">
        <i class="fa-regular fa-flashlight shrink-0"></i>
      </button>
    } @else {
      <button
        variant="ghost"
        class="dark:hover:bg-background/10 dark:text-white"
        size="icon"
        [attr.title]="'preview.toggleExtracts' | transloco"
        (click)="toggleExtracts()">
        <span class="fa-stack shrink-0 items-center justify-center">
          <i class="fa-regular fa-flashlight fa-stack-1x"></i>
          <i class="fa-regular fa-slash fa-stack-1x"></i>
        </span>
      </button>
    }

    @if (entities()) {
      <button
        variant="ghost"
        class="dark:hover:bg-background/10 dark:text-white"
        size="icon"
        [title]="'preview.toggleEntities' | transloco"
        (click)="toggleEntities()">
        <i class="fa-regular fa-lightbulb shrink-0"></i>
      </button>
    } @else {
      <button
        variant="ghost"
        class="dark:hover:bg-background/10 dark:text-white"
        size="icon"
        [attr.title]="'preview.toggleEntities' | transloco"
        (click)="toggleEntities()">
        <i class="fa-regular fa-lightbulb-slash shrink-0"></i>
      </button>
    }
  `
})
export class PreviewActionsComponent {
  private readonly previewService = inject(PreviewService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore);

  protected readonly extracts = signal(true);
  protected readonly entities = signal(false);
  /**
   * Signal to control the visibility of AI-generated descriptions.
   * Initially set to false, indicating that the AI description is not shown.
   */
  protected readonly showAIDescription = signal(false);
  /**
   * Computed signal that checks if the article has an AI-generated description.
   * It checks the flags of the article in the selection store to see if it includes 'ps'.
   */
  protected readonly hasAIDescription = signal(false);

  constructor() {
    effect(() => {
      const { article } = getState(this.selectionStore);
      if (!article) return;
      this.hasAIDescription.set(article.flags?.includes("ps") ?? false);
    });

    const controller = new AbortController();

    window.addEventListener(
      "message",
      (event: MessageEvent) => {
        const message = event.data;
        if (message.type === "selected-position") {
          this.previewService.toggle(this.extracts(), this.entities());
        }

        if (message.type === "ready") {
          this.previewService.toggle(this.extracts(), this.entities());
        }
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => controller.abort());
  }

  zoomIn(): void {
    this.previewService.zoomIn();
  }

  zoomFit(): void {
    this.previewService.zoomFit();
  }

  zoomOut(): void {
    this.previewService.zoomOut();
  }

  toggleAIDescription() {
    this.previewService.toggleAIDescription(!this.showAIDescription());
    this.showAIDescription.set(!this.showAIDescription());
  }

  toggleExtracts() {
    this.toggle("extracts");
  }

  toggleEntities() {
    this.toggle("entities");
  }

  /**
   * Toggles the visibility of extracts or entities.
   * If the specified type is already active, it will be deactivated.
   * @param type - The type to toggle ('extracts' or 'entities').
   */
  private toggle(type: "extracts" | "entities") {
    // Determine the current signal based on the type, and toggle its value
    const currentSignal = type === "extracts" ? this.extracts : this.entities;
    const value = !currentSignal();
    currentSignal.set(value);

    // Notify the preview service of the updated states
    this.previewService.toggle(this.extracts(), this.entities());

    // If extracts are being turned off, send an 'unselect' action to the preview service
    if (type === "extracts" && value === false) {
      this.previewService.sendMessage({ action: "unselect" });
    }
  }
}

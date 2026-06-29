import { Component, DestroyRef, effect, inject, input, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { PreviewService, SelectionStore } from "@sinequa/atomic-angular";
import {
  ArrowsMaximizeIcon,
  ButtonComponent,
  FlashlightIcon,
  IconButtonComponent,
  LightbulbIcon,
  LightbulbSlashIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  SlashIcon,
  SparklesIcon
} from "@sinequa/ui";

/**
 * Preview actions component
 * Usage:
 * ```html
 * <preview-actions></preview-actions>
 * </html>
 * This component provides action buttons for interacting with the preview content,
 * including zoom controls and toggles for AI descriptions, extracts, and entities.
 *
 */
@Component({
  selector: "preview-actions",
  imports: [
    TranslocoPipe,
    ButtonComponent,
    ArrowsMaximizeIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    SparklesIcon,
    SlashIcon,
    FlashlightIcon,
    LightbulbIcon,
    LightbulbSlashIcon,
    IconButtonComponent
  ],
  template: `
    <button variant="none" icon-button   [attr.title]="'preview.zoomFit' | transloco" (click)="zoomFit()">
      <arrows-maximize-icon class="shrink-0" />
    </button>

    <button variant="none" icon-button   [attr.title]="'preview.zoomIn' | transloco" (click)="zoomIn()">
      <magnifying-glass-plus-icon class="shrink-0" />
    </button>

    <button variant="none" icon-button   [attr.title]="'preview.zoomOut' | transloco" (click)="zoomOut()">
      <magnifying-glass-minus-icon class="shrink-0" />
    </button>

    @if (isPrimary()) {
      @if (hasAIDescription()) {
        @if (showAIDescription()) {
          <button
            variant="none" icon-button

            [attr.title]="'preview.toggleAIDescription' | transloco"
            (click)="toggleAIDescription()">
            <sparkles-icon class="shrink-0" />
          </button>
        } @else {
          <button
            variant="none" icon-button


            [attr.title]="'preview.toggleAIDescription' | transloco"
            (click)="toggleAIDescription()">
            <span class="relative shrink-0 inline-flex items-center justify-center">
              <sparkles-icon />
              <slash-icon class="absolute" />
            </span>
          </button>
        }
      }

      @if (extracts()) {
        <button
          variant="none" icon-button


          [attr.title]="'preview.toggleExtracts' | transloco"
          (click)="toggleExtracts()">
          <flashlight-icon class="shrink-0" />
        </button>
      } @else {
        <button
          variant="none" icon-button


          [attr.title]="'preview.toggleExtracts' | transloco"
          (click)="toggleExtracts()">
          <span class="relative shrink-0 inline-flex items-center justify-center">
            <flashlight-icon />
            <slash-icon class="absolute" />
          </span>
        </button>
      }

      @if (entities()) {
        <button
          variant="none" icon-button


          [title]="'preview.toggleEntities' | transloco"
          (click)="toggleEntities()">
          <lightbulb-icon class="shrink-0" />
        </button>
      } @else {
        <button
          variant="none" icon-button


          [attr.title]="'preview.toggleEntities' | transloco"
          (click)="toggleEntities()">
          <lightbulb-slash-icon class="shrink-0" />
        </button>
      }
    }
  `
})
export class PreviewActionsComponent {
  private readonly previewService = inject(PreviewService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore);

  readonly isPrimary = input<boolean>(false);

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

    if (type === "extracts") {
      if (value === false) {
        this.previewService.sendMessage({ action: "unselect" });
      } else {
        const selectedId = this.previewService.selectedHighlightId();
        if (selectedId !== undefined) {
          this.previewService.sendMessage({ action: "select", id: selectedId, usePassageHighlighter: true });
        }
      }
    }
  }
}

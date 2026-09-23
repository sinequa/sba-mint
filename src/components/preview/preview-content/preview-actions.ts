import { Component, DestroyRef, effect, inject, input, linkedSignal, output, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { PreviewData } from "@sinequa/atomic";
import { CConverter, PreviewService, SelectionStore } from "@sinequa/atomic-angular";
import { ButtonComponent, FlashlightIcon, LightbulbIcon, LightbulbSlashIcon, SlashIcon, SparklesIcon } from "@sinequa/ui";
import { ConverterSelectComponent } from "../converter-select/converter-select";
import { FloatingToolbarComponent } from "./floating-toolbar";
import { ZoomControlsComponent } from "./zoom-controls";

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
    SparklesIcon,
    SlashIcon,
    FlashlightIcon,
    LightbulbIcon,
    LightbulbSlashIcon,
    ConverterSelectComponent,
    ZoomControlsComponent,
    FloatingToolbarComponent
  ],
  template: `
    <floating-toolbar>
      <converter-select
        [previewData]="previewData()"
        [activeConversion]="activeConversion()"
        (onConversionSelect)="onConversionSelect.emit($event)" />

      <zoom-controls (zoomFit)="zoomFit()" (zoomIn)="zoomIn()" (zoomOut)="zoomOut()" />

      @if (isPrimary()) {
        @if (hasAIDescription()) {
          @if (showAIDescription()) {
            <button
              variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md"
              [attr.title]="'preview.toggleAIDescription' | transloco"
              (click)="toggleAIDescription()">
              <sparkles-icon class="shrink-0" />
            </button>
          } @else {
            <button
              variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md"
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
            variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md"
            [attr.title]="'preview.toggleExtracts' | transloco"
            (click)="toggleExtracts()">
            <flashlight-icon class="shrink-0" />
          </button>
        } @else {
          <button
            variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md"
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
            variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md"
            [attr.title]="'preview.toggleEntities' | transloco"
            (click)="toggleEntities()">
            <lightbulb-icon class="shrink-0" />
          </button>
        } @else {
          <button
            variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md"
            [attr.title]="'preview.toggleEntities' | transloco"
            (click)="toggleEntities()">
            <lightbulb-slash-icon class="shrink-0" />
          </button>
        }
      }
    </floating-toolbar>
  `
})
export class PreviewActionsComponent {
  private readonly previewService = inject(PreviewService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore);

  readonly isPrimary = input<boolean>(false);

  /**
   * True when the iframe revealed an AI page description by itself, because the
   * cited passage lives inside it. Drives {@link showAIDescription} so the toggle
   * does not claim the description is hidden while it is on screen.
   */
  readonly aiDescriptionShown = input<boolean>(false);

  /** Loaded preview data, forwarded to `<converter-select>`. */
  readonly previewData = input<PreviewData | undefined>(undefined);
  /** The conversion already active upstream, forwarded to `<converter-select>` so it can re-sync
   *  its selection on remount instead of always resetting to the first option. */
  readonly activeConversion = input<CConverter | undefined>(undefined);
  /** Forwards `<converter-select>`'s selected converter to the parent. */
  readonly onConversionSelect = output<CConverter | undefined>();

  protected readonly extracts = signal(true);
  protected readonly entities = signal(false);
  /**
   * Visibility of the AI-generated descriptions. Follows `aiDescriptionShown`,
   * and can still be toggled locally by the button.
   */
  protected readonly showAIDescription = linkedSignal(() => this.aiDescriptionShown());
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

    if (type !== "extracts") return;

    if (value === false) {
      this.previewService.sendMessage({ action: "unselect" });
      return;
    }

    const selectedId = this.previewService.selectedHighlightId();
    if (selectedId === null) return;
    this.previewService.sendMessage({ action: "select", id: selectedId, usePassageHighlighter: true });
  }
}

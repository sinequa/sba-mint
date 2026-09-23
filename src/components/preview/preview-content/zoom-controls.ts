import { Component, output } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { ArrowsMaximizeIcon, ButtonComponent, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from "@sinequa/ui";

/**
 * Zoom fit/in/out buttons, shared between `<preview-actions>` (which zooms the iframe, via
 * `PreviewService`/preview.js) and `preview-content`'s Markdown branch (which zooms the rendered
 * `<div>` locally — there is no iframe, so no preview.js to postMessage into). Purely presentational:
 * emits its outputs, the host decides what "zoom" means for its own content.
 *
 * Usage:
 * ```html
 * <zoom-controls (zoomFit)="zoomFit()" (zoomIn)="zoomIn()" (zoomOut)="zoomOut()" />
 * ```
 */
@Component({
  selector: "zoom-controls",
  imports: [TranslocoPipe, ButtonComponent, ArrowsMaximizeIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon],
  host: {
    class: "inline-flex gap-1"
  },
  template: `
    <button variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md" [attr.title]="'preview.zoomFit' | transloco" (click)="zoomFit.emit()">
      <arrows-maximize-icon class="shrink-0" />
    </button>

    <button variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md" [attr.title]="'preview.zoomIn' | transloco" (click)="zoomIn.emit()">
      <magnifying-glass-plus-icon class="shrink-0" />
    </button>

    <button variant="outline" [iconOnly]="true" size="sm" class="border-foreground/10 bg-background shadow-md" [attr.title]="'preview.zoomOut' | transloco" (click)="zoomOut.emit()">
      <magnifying-glass-minus-icon class="shrink-0" />
    </button>
  `
})
export class ZoomControlsComponent {
  zoomFit = output<void>();
  zoomIn = output<void>();
  zoomOut = output<void>();
}

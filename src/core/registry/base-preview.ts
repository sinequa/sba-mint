import { Directive, input } from "@angular/core";
import { PreviewData } from "@sinequa/atomic";

/**
 * Base class for preview components.
 * previewData is required and must be a PreviewData.
 */

@Directive({
  selector: "app-base-preview",
  standalone: true,
})
export abstract class BasePreview {
  public readonly previewData = input.required<PreviewData>();
}
import { Component, computed, effect, inject, input, model, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslocoPipe } from "@jsverse/transloco";
import { PreviewData } from "@sinequa/atomic";
import { AppStore, CConverter } from "@sinequa/atomic-angular";

/**
 * Converter (multi-format) select
 *
 * Usage:
 * ```html
 * <converter-select
 *    [previewData]="previewData()"
 *    (onConversionSelect)="conversion.set($event)" />
 * ```
 *
 * Renders the dropdown that lets the user pick which converter/format to preview, built from the
 * `general.converters` configured with `display: true` and matched against the loaded
 * `previewData.conversions`. It only renders when the `previewMultiConversion` feature is enabled
 * and at least one matching conversion exists — otherwise the host is hidden (zero footprint), so it
 * can be dropped into any layout (a tab bar row, a toolbar, etc.) without leaving a gap.
 *
 * The selected {@link CConverter} is emitted via `onConversionSelect` and should be fed into
 * `<preview-content [conversion]="...">` so the previewed URL switches accordingly.
 */
@Component({
  selector: "converter-select",
  standalone: true,
  imports: [FormsModule, TranslocoPipe],
  template: `
    @if (converterOptions().length) {
      <select
        class="h-8 rounded-md border border-foreground/10 bg-background px-2 hover:bg-muted hover:outline hover:outline-primary focus:bg-muted focus:outline focus:outline-primary"
        [(ngModel)]="currentConversionIndex">
        @for (option of converterOptions(); track $index) {
          <option [value]="$index">{{ option.name | transloco }}</option>
        }
      </select>
    }
  `,
  host: {
    "[class.hidden]": "!converterOptions().length"
  }
})
export class ConverterSelectComponent {
  protected readonly appStore = inject(AppStore);

  /** Loaded preview data, whose `conversions` are matched against the configured converters. */
  previewData = input<PreviewData | undefined>(undefined);
  /** Emits the currently selected converter (or undefined when none applies). */
  onConversionSelect = output<CConverter | undefined>();

  previewMultiConversion = computed(() => this.appStore.general()?.features?.previewMultiConversion);

  /** Index of the selected option inside {@link converterOptions}. */
  currentConversionIndex = model<number>(-1);
  currentConversion = computed<CConverter | undefined>(() =>
    this.currentConversionIndex() === -1 ? undefined : this.converterOptions()[this.currentConversionIndex()]
  );

  /** Configured converters (display: true) that have a matching conversion in the preview data. */
  converters = computed(() =>
    !this.previewData()?.conversions?.length
      ? undefined
      : this.appStore
          .general()
          ?.converters?.filter(
            converter =>
              converter.display && this.previewData()?.conversions?.some(c => c.converterName === converter.converter && c.format === converter.format)
          )
  );

  /** All options for the converters dropdown */
  converterOptions = computed(() => {
    // return [] if the feature is disabled or there are no available conversions
    const converters = this.converters();
    if (!this.previewMultiConversion() || !converters?.length) return [];

    return (
      converters
        .map(converter => ({
          ...converter,
          conversion: this.previewData()?.conversions?.find(c => c.converterName === converter.converter && c.format === converter.format)
        }))
        // sort to have defaults first, then primaries, then others
        .sort((a, b) => ((a.default && !b.default) || (!a.default && !b.default && a.primary && !b.primary) ? -1 : 1))
    );
  });

  constructor() {
    effect(() => {
      // setting the current conversion to the first conversion
      // (the conversions being sorted to be defaults then primaries first, the first element will always be the one to pick by default)
      if (this.previewMultiConversion() && this.converterOptions()?.length) {
        this.currentConversionIndex.set(0);
      }
    });

    effect(() => {
      if (this.previewMultiConversion()) {
        this.onConversionSelect.emit(this.currentConversion());
      }
    });
  }
}

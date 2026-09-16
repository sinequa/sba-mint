import { Component, computed, effect, inject, input, model, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslocoPipe } from "@jsverse/transloco";
import { PreviewData } from "@sinequa/atomic";
import { AppStore, CConverter } from "@sinequa/atomic-angular";
import { computeConverterOptions } from "./converter-options";

/**
 * Converter (multi-format) select
 *
 * Usage:
 * ```html
 * <converter-select
 *    [previewData]="previewData()"
 *    [activeConversion]="conversion()"
 *    (onConversionSelect)="conversion.set($event)" />
 * ```
 *
 * Renders the dropdown that lets the user pick which converter/format to preview, built from the
 * `general.converters` configured with `display: true` and matched against the loaded
 * `previewData.conversions`. It only renders when the `previewMultiConversion` feature is enabled
 * and at least one matching conversion exists — otherwise the host is hidden (zero footprint), so it
 * can be dropped into any layout (a tab bar row, a toolbar, etc.) without leaving a gap.
 *
 * The selected {@link CConverter} is emitted via `onConversionSelect`.
 */
@Component({
  selector: "converter-select",
  standalone: true,
  imports: [FormsModule, TranslocoPipe],
  template: `
    @if (converterOptions().length) {
      <select
        class="h-8 rounded-md border border-foreground/10 bg-background px-2 shadow-md hover:bg-muted hover:outline hover:outline-primary focus:bg-muted focus:outline focus:outline-primary"
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
  /**
   * The conversion already active upstream (the real single source of truth, owned by whichever
   * host embeds this dropdown — e.g. `preview-content`'s own internal `conversion` signal), if any.
   * Optional — this component still works standalone without it, defaulting to the first/primary
   * option. When provided, it's used to re-sync this dropdown's selection on (re)mount instead of
   * always resetting to the first option, which otherwise silently overwrites whatever was already
   * selected upstream whenever this component gets torn down and rebuilt by an unrelated reactive
   * change (e.g. nested inside `<preview-actions>`, itself inside `preview-content`'s own
   * conditionally-rendered branch).
   */
  activeConversion = input<CConverter | undefined>(undefined);
  /** Emits the currently selected converter (or undefined when none applies). */
  onConversionSelect = output<CConverter | undefined>();

  previewMultiConversion = computed(() => this.appStore.general()?.features?.previewMultiConversion);

  /** Index of the selected option inside {@link converterOptions}. */
  currentConversionIndex = model<number>(-1);
  currentConversion = computed<CConverter | undefined>(() =>
    this.currentConversionIndex() === -1 ? undefined : this.converterOptions()[this.currentConversionIndex()]
  );

  /** All options for the converters dropdown */
  converterOptions = computed(() => {
    if (!this.previewMultiConversion()) return [];
    return computeConverterOptions(this.previewData(), this.appStore.general()?.converters);
  });

  constructor() {
    effect(() => {
      const options = this.converterOptions();
      if (!this.previewMultiConversion() || !options.length) return;

      // Re-sync to the conversion already active upstream when there is one (e.g. this component
      // just got recreated by an unrelated reactive change) — comparing by converter+format, not
      // object identity, since converterOptions() re-maps fresh objects on every recompute. Only
      // fall back to the first/default option (conversions are sorted defaults then primaries
      // first) when nothing is active yet, i.e. a genuinely fresh document.
      const active = this.activeConversion();
      const matchedIndex = active ? options.findIndex(option => option.converter === active.converter && option.format === active.format) : -1;
      this.currentConversionIndex.set(matchedIndex !== -1 ? matchedIndex : 0);
    });

    effect(() => {
      if (this.previewMultiConversion()) {
        this.onConversionSelect.emit(this.currentConversion());
      }
    });
  }
}

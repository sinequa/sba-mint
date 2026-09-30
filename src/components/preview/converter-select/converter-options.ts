import { PreviewData } from "@sinequa/atomic";
import { CConverter } from "@sinequa/atomic-angular";

/** One configured converter, paired with the matching entry of `previewData.conversions`. */
export type ConverterOption = CConverter & {
  conversion: NonNullable<PreviewData["conversions"]>[number] | undefined;
};

/**
 * Matches the `general.converters` configured with `display: true` against the conversions loaded
 * in `previewData.conversions`, sorted defaults first, then primaries, then others — so the first
 * element of the result is always the one to pick by default.
 *
 * Shared between `<converter-select>` (which renders the full list) and `preview-content` (which
 * needs the default alone, computed synchronously, to resolve the right preview URL on the very
 * first render instead of a fallback URL later corrected once `<converter-select>` mounts).
 */
export function computeConverterOptions(previewData: PreviewData | undefined, generalConverters: CConverter[] | undefined): ConverterOption[] {
  if (!previewData?.conversions?.length || !generalConverters?.length) return [];

  const converters = generalConverters.filter(
    converter => converter.display && previewData.conversions?.some(c => c.converterName === converter.converter && c.format === converter.format)
  );

  return (
    converters
      .map(converter => ({
        ...converter,
        conversion: previewData.conversions?.find(c => c.converterName === converter.converter && c.format === converter.format)
      }))
      // sort to have defaults first, then primaries, then others
      .sort((a, b) => ((a.default && !b.default) || (!a.default && !b.default && a.primary && !b.primary) ? -1 : 1))
  );
}

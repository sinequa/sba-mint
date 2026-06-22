import { EnvironmentProviders, isDevMode, makeEnvironmentProviders } from "@angular/core";
import { TranslocoHttpLoaderOverrides } from "@config/transloco/transloco-loader-overrides";
import { provideTransloco } from "@jsverse/transloco";
import { provideTranslocoMessageformat } from "@jsverse/transloco-messageformat";

export function provideTranslocoProviders(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        availableLangs: ["en", "fr", "de"],
        defaultLang: "en",
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        fallbackLang: "en",
        missingHandler: {
          logMissingKey: true,
          useFallbackTranslation: true
        }
      },
      loader: TranslocoHttpLoaderOverrides
    }),
    provideTranslocoMessageformat()
  ]);
}

---
title: Localization
sidebar_position: 3
sidebar_class_name: new
---

This documentation provides step-by-step instructions on how to configure a new localization in your Sinequa application.
It guides you through the process of setting up language support, managing translations, and ensuring the application
is accessible to users in different locales.

## Step-by-Step Guide to Configure German (de) Localization

### 🗂️ Create a Localization File

Create a new file named `de.json` in the `src/assets/i18n` directory of your Angular project. If the `i18n` directory does not exist, create it.

<details>
<summary>Example of `de.json` file</summary>

```json title="src/assets/i18n/de.json"
{
  "back": "Zurück",
  "cancel": "Abbrechen",
  "close": "Schließen",
  "clear": "Löschen",
  "concepts": "Konzepte",
  "confirm": "Bestätigen",
  "create": "Erstellen",
  "delete": "Löschen",
  "extracts": "Auszüge",
  "export": "Exportieren",
  "filters": "Filter",
  "from": "Von",
  "myCollections": "Meine Sammlungen",
  "myBookmarks": "Meine Lesezeichen",
  "mySavedSearches": "Meine gespeicherten Suchen",
  "history": "Verlauf",
  "in": "In",
  "labels": "Beschriftungen",
  "lastUpdatedBy": "Zuletzt aktualisiert von",
  "lastUpdatedOn": "Zuletzt aktualisiert am",
  "loadMore": "Mehr laden",
  "location": "Ort",
  "logout": "Abmelden",
  "more": "Mehr",
  "tab": {
    "allresults": "Alle",
    "wikipedia": "Wikipedia",
    "sinequa": "Sinequa"
  },
  "results": {
    "results_all_tab": "Alle",
    "resultsAllTab": "Alle",
    "results_text_tab": "Text",
    "tabBusiness": "Geschäft",
    "tabLocation": "Ort",
    "tabPeople": "Personen",
    "web": "Internet",
    "pdf": "PDF",
    "word": "Word",
    "excel": "Excel",
    "powerpoint": "Powerpoint"
  },
  "sort": {
    "date": "Datum",
    "filename": "Dateiname",
    "relevance": "Relevanz",
    "title": "Titel"
  },
  "column": {
    "authors": "Autoren",
    "treepath": "Quelle",
    "concepts": "Konzepte",
    "sizes": "Größen",
    "companies": "Unternehmen",
    "company": "Unternehmen",
    "docformats": "Formate",
    "docformat": "Format",
    "doctypes": "Dokumenttypen",
    "doctype": "Dokumenttyp",
    "documentlanguages": "Sprachen",
    "fileexts": "Dateiendungen",
    "filenames": "Dateinamen",
    "geos": "Orte",
    "geo": "Ort",
    "modified": "Datum",
    "persons": "Personen",
    "person": "Person"
  },
  "nextPage": "Nächste Seite",
  "open": "Öffnen",
  "people": "Personen",
  "previewUnavailable": "Vorschau für diese Datei ist leider nicht verfügbar.",
  "previousPage": "Vorherige Seite",
  "save": "Speichern",
  "search": "Suche",
  "seeMore": "Alle anzeigen",
  "title": "Titel",
  "to": "Bis",
  "type": "Typ",
  "Date": "Datum",
  "Formats": "Formate",
  "Languages": "Sprachen",
  "Concepts": "Konzepte",
  "Money": "Geld",
  "Sources": "Quellen",
  "People": "Personen",
  "Places": "Orte",
  "Sizes": "Größen",
  "bookmark": "Lesezeichen",
  "recent-search": "Letzte Suchen",
  "saved-search": "Gespeicherte Suchen",
  "assistant": {
    "saved-chats": "Diskussionen",
    "new-discussion": "Neue Diskussion",
    "my-documents": "Meine Dokumente",
    "upload": "Hochladen",
    "uploaded": "Hochgeladen",
    "delete-all": "Alle löschen",
    "refresh": "Aktualisieren"
  }
}
```

</details>

### 🔧 Update the App Configuration

The Transloco configuration is centralised in `src/config/transcolo-providers.ts`. Add `'de'` to `availableLangs`:

```ts title="src/config/transcolo-providers.ts"
export function provideTranslocoProviders(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        // add
        availableLangs: ['en', 'fr', 'de'], // Add German to the list of available languages
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        fallbackLang: 'en',
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
```

In `app.config.ts`, also register the German locale data if you need locale-aware pipes (e.g. `DatePipe`, `CurrencyPipe`):

```ts title="src/app2/app.config.ts"
import { registerLocaleData } from '@angular/common';
// add
import localeDe from '@angular/common/locales/de';

// add
registerLocaleData(localeDe);

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideTranslocoProviders()
  ]
};
```

### 🌐 Update the User Menu

The user menu uses an `AllLanguages` array to render language options dynamically via `NgComponentOutlet`.
Add an entry for German in the component class:

```ts title="src/components/user-menu/user-menu.ts"
// add
import { FlagGermanIconComponent } from '@sinequa/ui';

@Component({
  selector: 'user-menu',
  imports: [
    NgComponentOutlet,
    FormsModule,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    TranslocoPipe,
    OverrideUserDialogComponent,
    ResetUserSettingsDialogComponent,
    UserIcon,
    ChevronRightIcon,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent,
    Separator
  ],
  templateUrl: './user-menu.html',
  providers: [provideTranslocoScope('user-menu')]
})
export class UserMenuComponent {
  AllLanguages: { code: SupportedLanguage; label: string; icon: Type<unknown> }[] = [
    { code: 'en', label: 'English', icon: FlagEnglishIconComponent },
    { code: 'fr', label: 'Français', icon: FlagFrenchIconComponent },
    // add
    { code: 'de', label: 'Deutsch', icon: FlagGermanIconComponent }
  ];
}
```

:::note
`FlagGermanIconComponent` must be imported from `@sinequa/ui`. There is no need to add it to the component's `imports` array — it is rendered dynamically by `NgComponentOutlet` at runtime.
:::

The HTML template iterates over `AllLanguages` and renders each flag with `*ngComponentOutlet`, so no template changes are needed:

```html title="src/components/user-menu/user-menu.html"
<MenuContent position="left-start" class="max-w-fit min-w-40">
  @for (lang of AllLanguages; track lang.code) {
    <MenuItem (click)="changeLanguage(lang.code)" class="justify-between">
      <span>{{ lang.label }}</span>
      <div class="flex items-center gap-2">
        @if (currentActiveLang() === lang.code) {
          <i class="fa-fw fas fa-check text-sm"></i>
        }
        <ng-container *ngComponentOutlet="lang.icon"></ng-container>
      </div>
    </MenuItem>
  }
</MenuContent>
```

### 🗣️ Update the User Menu Translations

To ensure the user menu supports German, add a `de.json` file in the `src/assets/i18n/user-menu` directory.

:::note
Language names (English, Français, Deutsch) are now hardcoded in the `AllLanguages` array in `user-menu.ts` and are no longer driven by translation keys.
:::

```json title="src/assets/i18n/user-menu/de.json"
{
  "aboutSinequa": "Über Sinequa",
  "overrideUser": "Benutzer überschreiben",
  "resetUserSettings": "Benutzereinstellungen zurücksetzen",
  "revertOverride": "Benutzerüberschreibung zurücknehmen",
  "selectLanguage": "Sprache auswählen",
  "selectTheme": "Design auswählen",
  "lightMode": "Hell",
  "darkMode": "Dunkel",
  "systemMode": "System"
}
```

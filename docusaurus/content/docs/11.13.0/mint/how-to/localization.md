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

In your `app.config.ts` file, set the default language to German (de):

```ts title="src/app/app.config.ts"
import { registerLocaleData } from '@angular/common';

// add-start
import localeDe from '@angular/common/locales/de';
registerLocaleData(localeDe); // needed to use DatePipe, CurrencyPipe, etc. for German locale
// add-end

export const appConfig: ApplicationConfig = {
  providers: [
    // add
    { provide: LOCALE_ID, useValue: 'de' }, // Set default locale to German if needed
    // other providers...
        provideTransloco({
      config: {
        // add
        availableLangs: ['en', 'fr', 'de'], // Add German to the list of available languages
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        fallbackLang: 'en',
        missingHandler: {
          logMissingKey: true,
          useFallbackTranslation: true
        }
      },
      loader: TranslocoHttpLoader
    }),
    provideTranslocoMessageformat()
  ],
}
```

### 🌐 Update the User Menu

This component is typically used to allow users to switch between languages.
In this example, we will modify the user menu to include a German language option.

```html title="src/components/user-menu/user-menu.html"
<menu>
  <Avatar class="cursor-pointer">
    ...
  </Avatar>

  <!-- min-w-max used to display all the content -->
  <MenuContent position="bottom-start" class="min-w-max">
    <menu position="left-start" class="dropdown-content">
      <menuitem>
        <span class="grow">{{ 'userMenu.selectLanguage' | transloco }}</span>
        <ChevronRight class="size-4" />
      </menuitem>

      <!-- max with to fit content but min width is 10rem (160px) -->
      <MenuContent position="left-start" class="max-w-fit min-w-40">
        <menuitem (click)="changeLanguage('en')" class="justify-between">
          <span>{{ 'userMenu.english' | transloco }}</span>
          <FlagEnglish class="size-4" />
        </menuitem>

        <menuitem (click)="changeLanguage('fr')" class="justify-between">
          <span>{{ 'userMenu.french' | transloco }}</span>
          <FlagFrench class="size-4" />
        </menuitem>

        // add-start
        <menuitem (click)="changeLanguage('de')" class="justify-between">
          <span>{{ 'userMenu.deutsch' | transloco }}</span>
          <FlagGerman class="size-4" />
        </menuitem>
        // add-end
      </MenuContent>
    </menu>
    ...
</menu>
```

```ts title="src/components/user-menu/user-menu.ts"
import { FlagGermanIcon } from '@sinequa/ui';

@Component({
  selector: 'app-user-menu',
  imports: [
    FormsModule,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    HorizontalDividerComponent,
    TranslocoPipe,
    OverrideUserDialogComponent,
    ResetUserSettingsDialogComponent,
    FlagEnglishIconComponent,
    FlagFrenchIconComponent,
    // add
    FlagGermanIcon,
    UserRoundIconComponent,
    ChevronRightIconComponent,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent
  ],
  templateUrl: './user-menu.html',
  providers: [provideTranslocoScope('user-menu')]
})
export class UserMenuComponent { ... }
```

:::note
Make sure to import the `FlagGermanIcon` from the Sinequa UI library in your component file.
:::

### 🗣️ Update the User Menu Translations

To ensure the user menu supports German, update or add the `de.json` file in the `src/assets/i18n/user-menu` directory
with the necessary translations.

```json title="src/assets/i18n/user-menu.json"
{
  "aboutSinequa": "Über Sinequa",
  "administration": "Verwaltung",
  "contactAdmin": "Administrator kontaktieren",
  "english": "Englisch",
  "french": "Französisch",
  "deutsch": "Deutsch",
  "overrideUser": "Benutzer überschreiben",
  "resetUserSettings": "Benutzereinstellungen zurücksetzen",
  "revertOverride": "Benutzerüberschreibung zurücknehmen",
  "selectLanguage": "Sprache auswählen",
  "help": "Hilfe"
}
```

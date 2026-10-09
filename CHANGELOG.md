# Changelog

All notable changes to the SBA Mint project for release 11.13.0.

## [Release 11.13.0] - 2026-03-11

### Added

#### New Application Architecture (`src/app2/`)

- **Complete alternative application structure**: New `src/app2/` directory providing an updated app layout
  - `src/app2/app.component.html` / `app.component.ts` — root component
  - `src/app2/app.config.ts` — application bootstrap configuration
  - `src/app2/routes.ts` — routing configuration
  - `src/app2/pages/assistant/assistant.layout.ts` — assistant page layout
  - `src/app2/pages/home/home.html` / `home.ts` — home page
  - `src/app2/pages/search/search-all.html` / `search-all.ts` / `search-layout.ts` — search pages
  - `src/app2/pages/widgets/widgets-layout.ts` — widgets layout

#### New Standalone Components Library (`src/components/`)

- **Assistant**: `src/components/assistant/assistant.ts`, `assistant.css`, `document-upload/assistant-upload.component.ts`, `document-upload/upload.dialog.ts`
- **Cards**: `src/components/cards/menu.ts`, `record/record-card.html`, `record/record-card.ts`, `record/skeleton.ts`, `slide/slide-card.html`, `slide/slide-card.ts`
- **Preview**: `src/components/preview/dialog/preview-dialog.html`, `preview-dialog.ts`, `preview-content/preview-actions.ts`, `preview-content/preview-content.ts`, `preview-header/preview-header.html`, `preview-header/preview-header.ts`, `preview-navbar2/preview-navbar.html`, `preview-navbar2/preview-navbar.ts`, `preview-tabs/preview-tabs.ts`, `preview.html`, `preview2.ts`, `sheet-previewer.ts`
- **Search**: `src/components/search/autocomplete/autocomplete.component.html`, `autocomplete.component.ts`, `saved-search-popover/saved-search-popover.ts`, `search-with-autocomplete.ts`, `search.component.html`, `search.component.ts`
- **Sidebar**: `src/components/sidebar/sidebar.html`, `sidebar.ts`
- **User Menu**: `src/components/user-menu/user-menu.html`, `user-menu.ts`
- **Widgets**: `src/components/widgets/bookmarks/bookmarks.component.html`, `bookmarks.component.ts`, `collections/collections.component.ts`, `recent-searches/recent-searches.component.ts`, `saved-searches/saved-searches.component.html`, `saved-searches.component.ts`, `widgets-sidebar-group.ts`, `widgets-tabs.ts`

#### New Configuration & Registry (`src/config/`, `src/registry/`)

- **Bootstrap helper**: `src/config/bootstrap-new-app.ts` — utility to switch to the new app layout
- **Highlight config**: `src/config/highlight.config.ts` — syntax highlighting configuration
- **Transloco loader**: `src/config/transloco-loader.ts` — i18n loader configuration
- **Document type registry**: `src/registry/document-type-registry.ts` — registry for document type handling

#### Preview Components

- **Preview Navbar**: New `src/app/components/preview/preview-navbar/preview-navbar.html` and `preview-navbar.ts` with back navigation, open/expand/bookmark/copy-link actions
- **Preview Actions**: New `src/app/components/preview/preview-content/preview-actions.ts` with zoom controls and toggles for AI descriptions, extracts, and entities

#### User Menu — Try New UI

- **New layout switcher**: Added "Try the new UI" menu item in the user menu (`src/app/components/user-menu/user-menu.html` / `user-menu.ts`)
  - Controlled by `features.newUI` feature flag via `AppStore`
  - Calls `bootstrapNewApp()` to switch to the new application layout

#### Search Enhancements

- **Spelling Correction Mode**: Added `SpellingCorrectionMode` (`c`) query parameter support in `search-all.component.ts`
  - New `c` URL param synced with `spellingCorrectionMode` in `QueryParamsStore`
  - Passed through to query execution

#### Internationalization

- **User menu translations**: Added `userMenu.tryNewLayout` key
  - English: `"Try the new UI"`
  - French: `"Essayer la nouvelle UI"`
  - German: `"Die neue UI ausprobieren"`

#### Documentation

- **Drawer Component**: New `docusaurus/docs/atomic-angular/components/drawer/drawer.component.md` with full usage documentation
- **Changelog**: Added `docusaurus/docs/changelog.md`
- **Pager**: Added examples to `docusaurus/docs/atomic-angular/components/pager.md`
- **Search Service**: Updated `docusaurus/docs/atomic-angular/services/search.md`

### Changed

#### Dependencies

- **Package version**: `0.0.0` → `11.13.0`
- **Sinequa Packages**: Updated to latest versions
  - `@sinequa/assistant`: `^3.10.5` → `^3.10.10`
  - `@sinequa/atomic`: `^0.0.129` → `^0.0.137`
  - `@sinequa/atomic-angular`: `^0.3.15` → `^0.4.12`
  - `@sinequa/ui`: `^0.2.4` → `^0.2.10`
- **New dependency**: `@tanstack/angular-virtual: ^4.0.7`
- **Removed**: `@angular-eslint/schematics`
- **Overrides**: Added `ajv: 8.18.0` to resolve peer dependency conflict

#### Configuration

- **`.gitignore`**: Added `/src/assets/i18n/user-profile` to ignored paths
- **`tsconfig.json`**: Added TypeScript path aliases `@components/*`, `@config/*`, `@registry/*`

#### Component Refactoring

- **Assistant**: Simplified template by removing `@for` wrapper around `sq-chat-v3`; removed unused `ChangeDetectorRef` and `PrincipalStore` imports
- **Search All**: Refactored effects with clearer comments distinguishing URL-sync from query-key updates; `spellingCorrectionMode` now included in query keys
- **Search Layout**: Added `z-20` class to `PageHeader` for correct stacking context
- **Sidebar**: Marked `AppSidebarComponent` as `@deprecated`
- **Search All**: Marked `SearchAllComponent` as `@deprecated`
- **Search Layout**: Marked layout component as `@deprecated`
- **User Menu**: Marked `UserMenuComponent` as `@deprecated`; switched `principal` access to use `getState` directly

#### Styling

- **`chat-v3.css`**: Differentiated user vs. assistant message color styles; added table color; improved action button hover scaling; removed `z-index` override
- **`saved-chat-v3.css`**: Refactored and reduced styles
- **`theme.css`**: Updated theme variables
- **`themes/chapsvision.css`**: Major refactor of CSS variable definitions
- **`themes/sinequa.css`**: Updated theme variables
- **`highlights.css`**: Adjusted highlight styles
- **`styles.css`**: Added new utility imports

#### Documentation

- **`drawer-stack.md`**: Updated drawer stack documentation
- **`filter-button.md`**: Removed outdated content
- **`090_setup-multi-selection.md`**: Updated multi-selection tutorial

### Migration Notes for This Release

- **New UI**: A new application layout (`src/app2/`) is available as a preview. It can be activated via the user menu when the `features.newUI` flag is enabled in the app configuration.

- **TypeScript path aliases**: Code can now use `@components/*`, `@config/*`, and `@registry/*` aliases. Update imports accordingly when using the new component library.

- **Deprecated components**: `AppSidebarComponent`, `SearchAllComponent`, `SearchLayoutComponent`, and `UserMenuComponent` in `src/app/` are now marked `@deprecated`. Migrate to equivalents in `src/components/` and `src/app2/`.

- **Spelling correction**: If you use search URL parameters, the new `c` param maps to `SpellingCorrectionMode`. No action required unless you parse URLs manually.

### Breaking Changes

- None

---

## [Release 11.13.0] - 2025-12-19

### Added

#### Documentation

- **Features Configuration**: Added comprehensive documentation for configurable application features
  - `allowChangePassword`: Toggle password change functionality
  - `advancedSearch`: Enable/disable advanced search features
  - `filterLinkChildren`: Control filter link children functionality
  - `quickFilter`: Toggle quick filter availability
  - `expandPreview`: Enable/disable preview expansion feature
  - Added example JSON configuration and usage instructions to `docusaurus/docs/mint/configurations/customization.mdx`

#### Components

- **Upload Dialog**: New upload dialog component for assistant document uploads
  - `src/app/pages/assistant/document-upload/upload.dialog.ts`
  - Provides a dedicated dialog interface for document upload workflows

#### Assets

- **Custom Fonts**: Added HankenGrotesk font family
  - `HankenGrotesk-Regular.ttf`
  - `HankenGrotesk-SemiBold.ttf`
  - `HankenGrotesk-Bold.ttf`

- **Logo Assets**: Added SVG logo files
  - `logo.svg` for standard display
  - `logo-blanc.svg` for inverted/dark backgrounds

#### Styling

- **Theme System Enhancement**: Significantly expanded CSS variable system
  - AI/Assistant colors: `--color-ai`, `--color-ai-light`, `--color-ai-dark`, `--color-ai-foreground`
  - Warning colors: `--color-warning`, `--color-warning-light`, `--color-warning-dark`, `--color-warning-foreground`
  - Info colors: `--color-info`, `--color-info-light`, `--color-info-dark`, `--color-info-foreground`
  - Error colors: `--color-error`, `--color-error-light`, `--color-error-dark`, `--color-error-foreground`
  - Backdrop styling: `--backdrop-blur`, `--backdrop-opacity`
  - Enhanced theme customization for all color themes (Chapsvision, Green, Orange, Sinequa, Teal, Violet, Yellow)

- **Chat UI**: Added new chat-related styles in `chat-v3.css`
  - Enhanced visual feedback for chat interactions

### Changed

#### Dependencies

- **Sinequa Packages**: Updated to latest versions
  - `@sinequa/assistant`: `3.10.2` → `^3.10.4`
  - `@sinequa/atomic`: `^0.0.123` → `^0.0.129`
  - `@sinequa/atomic-angular`: `^0.2.5` → `^0.3.8`
  - `@sinequa/ui`: `^0.1.49` → `^0.2.3`

#### Configuration

- **Prettier**: Updated configuration to include `cva` in `tailwindFunctions` array
  - Ensures proper formatting for class-variance-authority utility classes

#### Documentation

- **Tokens Documentation**: Removed `APP_FEATURES` token documentation from `tokens.md`
  - Information now comprehensively covered in the new features section of `customization.mdx`

- **Changelog**: Updated changelog title for consistency

#### Component Refactoring

- **Preview System**: Major refactoring for improved modularity
  - Simplified `preview.ts` by moving logic to specialized components
  - Enhanced `preview-tabs.ts` with better state management
  - Improved `preview-content.ts` for better content rendering
  - Updated `preview-header.html` and `preview-header.ts` for better UX
  - Refined `preview-dialog.html` and `preview-dialog.ts` for dialog interactions
  - Updated `preview-navbar` components for consistency

- **Search Components**: Enhanced search functionality
  - Improved `autocomplete.component` with better type handling
  - Enhanced `saved-search-popover` with refined interactions
  - Updated `search.component` with better state management

- **Layout Components**: Refined user interface components
  - Updated `app.component` with better structure
  - Enhanced `navbar.component` with improved styling
  - Refined `sidebar.component` for better navigation
  - Updated `user-menu` with improved menu interactions

- **Assistant Components**: Improved assistant functionality
  - Enhanced `assistant.ts` with better integration
  - Refactored `assistant-upload.component` with new dialog pattern
  - Improved `assistant.layout` for better page structure

- **Home Page**: Updated home component structure
  - Improved layout and styling

- **Widget Components**: Enhanced collections widget
  - Improved `collections.component` with better validation

#### Styling

- **Preview Styles**: Updated `preview.css` with enhanced styling
  - Better visual feedback for preview interactions

- **Global Styles**: Cleaned up `styles.css`
  - Moved 185 lines of CSS to more appropriate locations
  - Better organization and maintainability

- **CSS Overrides**: Enhanced `styles.css` in css-overrides
  - Better Bootstrap to Tailwind compatibility

#### Scripts

- **Preview Script**: Enhanced `preview.js` with additional functionality

### Removed

- **Documentation**: Removed redundant `APP_FEATURES` documentation from tokens.md
  - Information consolidated into customization.mdx features section

### Migration Notes for This Release

- **Theming**: If you have custom themes, review the new CSS variables for AI, warning, info, and error colors. These provide better consistency across components.

- **Fonts**: The application now includes HankenGrotesk as a custom font. Ensure your deployment includes the new font files from `src/assets/fonts/`.

- **Features Configuration**: The features configuration documentation has moved to a dedicated section. Update any internal documentation references accordingly.

- **Preview Components**: If you've extended preview components, review the refactored structure as logic has been reorganized into more specialized components.

### Breaking Changes

- None

---

## [Release 11.13.0] - 2025-12-05

### Changed

#### Dependencies

- **Angular Core Packages**: Updated from v20.0.0 to v20.3.15
  - `@angular/animations`: `^20.0.0` → `^20.3.15`
  - `@angular/common`: `^20.0.0` → `^20.3.15`
  - `@angular/compiler`: `^20.0.0` → `^20.3.15`
  - `@angular/core`: `^20.0.0` → `^20.3.15`
  - `@angular/elements`: `^20.3.1` → `^20.3.15`
  - `@angular/forms`: `^20.0.0` → `^20.3.15`
  - `@angular/platform-browser`: `^20.0.0` → `^20.3.15`
  - `@angular/platform-browser-dynamic`: `^20.0.0` → `^20.3.15`
  - `@angular/router`: `^20.0.0` → `^20.3.15`

- **Angular CDK**: Updated from v20.0.1 to v20.2.14
  - `@angular/cdk`: `^20.0.1` → `^20.2.14`

- **Sinequa Packages**: Updated to latest versions
  - `@sinequa/atomic`: `^0.0.123` → `^0.0.124`
  - `@sinequa/atomic-angular`: `^0.2.5` → `^0.2.10`
  - `@sinequa/ui`: `^0.1.49` → `^0.1.51`

- **Angular Dev Dependencies**: Updated build tools
  - `@angular/build`: `^20.0.0` → `^20.3.13`
  - `@angular/cli`: `^20.0.0` → `^20.3.13`
  - `@angular/compiler-cli`: `^20.0.0` → `^20.3.15`

### Migration Notes for This Release

- **Angular 20.3.15**: This update includes bug fixes and performance improvements. No code changes required for existing implementations.
- **Sinequa Packages**: Updated packages may include new features or fixes - refer to their respective [changelogs](https://github.com/sinequa/sba-mint/blob/dev/11/CHANGELOG_SQ.md) for details.
- **Breaking Changes**: None

---

## [Release 11.13.0] - 2025-11-29

### Added

#### Preview Dialog Feature

- **New Preview Dialog Component**: Added full-screen preview dialog with integrated assistant and search capabilities
  - `src/app/components/preview/dialog/preview-dialog.html`
  - `src/app/components/preview/dialog/preview-dialog.ts`
  - Supports three tabs: Chat, Summary, and Find (Advanced Search)
  - Collapsible sidebar for better space management
  - Integrated with chat-with-document and summarize assistants

#### Assistant Enhancements

- **Suggested Actions Support**: Added handling for `Prefill` and `Submit` action types in assistant component
  - New `submitQuestion()` method to programmatically submit questions
  - New `insertText()` method to insert text at cursor position in chat input
  - Enhanced `handleSuggestAction()` method with type-based routing

#### Navigation Improvements

- **Smart Back Navigation**: Implemented history-aware back navigation
  - Added `backLevel` tracking in sidebar, navbar, and assistant layout
  - Replaced simple `location.back()` with `location.historyGo(backLevel)`
  - Dynamically tracks navigation depth for accurate back button behavior

#### Application Title Management

- **Dynamic Page Titles**: Integrated `ApplicationService` for consistent page title updates
  - Home page sets title to "Home"
  - Search pages set title to "Search"
  - Assistant page sets title to "Assistant"
  - Preview page sets title to document title
  - Widget pages set localized titles (Bookmarks, Collections, Recent Searches, Saved Searches)
  - Titles update automatically when drawers close

#### Custom Elements & Markdown Configuration

- **Assistant Custom Elements**: Configured custom elements for enhanced chat rendering
  - Document references
  - Page references
  - Image references
  - Code blocks with syntax highlighting
  - Table tools
- **Markdown-it Plugins**: Registered markdown-it plugins for rich content rendering

#### UI/UX Improvements

- **Expand Preview Button**: Added expand button to preview navbar with feature flag support
- **External Link Handling**: Enhanced record and slide cards to open external URLs
  - Only show underline on hover when `url1` exists
  - Added `openExternal()` method to cards
- **Enhanced Metadata Display**: Improved docformat/doctype badge rendering
  - Returns object with `field` and `value` properties
  - Better click handling for filter application

#### Internationalization

- **Preview Dialog Translations**: Added translations for preview dialog UI
  - English: expand, chat, summary, find, collapse/expand sidebar
  - French: étendre, chat, résumé, rechercher, réduire/étendre la barre latérale
  - German: Expandieren, Chat, Zusammenfassung, Suchen, Seitenleiste minimieren/erweitern

### Changed

#### Dependencies

- **Package Updates**: Updated multiple core dependencies
  - `@angular-architects/ngrx-toolkit`: ^18.1.1 → ^20.0.0
  - `@ngrx/signals`: ^18.1.1 → ^20.1.0
  - `@ngrx/store`: ^18.1.1 → ^20.1.0
  - `@sinequa/assistant`: ^3.9.11-dev.4 → 3.10.2
  - `@sinequa/atomic`: ^0.0.121 → ^0.0.123
  - `@sinequa/atomic-angular`: ^0.1.88 → ^0.2.5
  - `@sinequa/ui`: ^0.1.37 → ^0.1.49
- **Dev Dependencies**: Added `@types/markdown-it`: ^14.1.2

#### Routing

- **Removed Routes**: Cleaned up unused routes
  - Removed `/preview/:id` route
  - Removed `/ui-tester` route

#### Component Refactoring

- **Card Components**: Refactored record and slide cards
  - Removed `RouterLink` imports
  - Changed title links to use click handlers instead of routing
  - Enhanced docformat metadata to return structured objects

#### Styling

- **Logo Display**: Moved logo CSS from inline styles to utility classes
  - Home page: Added `content-[var(--logo-large)/var(--logo-alt-text)]`
  - Navbar: Added `content-[var(--logo-small)/var(--logo-alt-text)]`
  - Removed duplicate CSS rules from component styles

- **Theme Adjustments**:
  - Updated `--muted-foreground` colors for better contrast
  - Light mode: `var(--color-gray-600)` → `var(--color-gray-400)`
  - Dark mode: `var(--color-neutral-300)` → `var(--color-neutral-400)`

- **CSS Organization**:
  - Reordered imports in `styles.css` for better load sequence
  - Moved Sinequa utilities before theme imports
  - Proper ordering: utilities → datepicker → theme → overrides

- **Preview Highlights**: Added invisible extracts styles to `preview.css`
  - Transparent backgrounds for `.invisible .extractslocations`
  - Custom selection colors with transparency
  - Match locations with red-tinted highlights

#### Configuration

- **Assistant Upload Dialog**: Fixed dialog close method call
  - Changed from `uploadDialog.close($event)` to `uploadDialog.close()`

#### Preview Header

- **Default State**: Changed preview header to collapsed by default
  - `headerCollapsed` initial value: `false` → `true`

### Removed

#### Dependencies

- **Removed Packages**: Cleaned up unused dependencies
  - `ngx-remark`
  - `remark`
  - `remark-gfm`
  - `remark-parse`

#### Lint Configuration

- **Lint-Staged**: Removed prettier command from lint-staged configuration
  - Previously ran `prettier --write` on staged files
  - Now empty array for file patterns

### Fixed

#### UI Components

- **Chat Styling**: Removed duplicate color definition in chat-v3.css
  - Removed redundant `color: var(--color-muted-foreground)` from summary elements

- **Bootstrap Overrides**: Added missing `.fw-bold` utility class
  - Maps to Tailwind's `font-bold`

- **Collections Widget**: Added validation for empty collection names
  - Prevents creating collections with whitespace-only names

#### Error Handling

- **Home Component**: Improved error logging
  - Reduces noise in error reporting for expected failures

#### File Formatting

- **Line Endings**: Normalized `highlights.css` line endings (CRLF)

## Migration Notes

### For Developers

1. **Assistant Integration**: If you're using the assistant component, update your code to use the new `ASSISTANT_CUSTOM_ELEMENTS` and `ASSISTANT_MARKDOWN_IT_PLUGINS` injection tokens for custom rendering.

2. **Navigation Updates**: Components using `location.back()` should now use `location.historyGo(backLevel)` with proper level tracking.

3. **Page Titles**: Inject `ApplicationService` and call `setTitle()` to update page titles. Consider drawer state changes when setting titles.

4. **Card Components**: If extending `RecordCard` or `SlideCard`, note the change in `docformatMetadata` return type from string to `{ field: string, value: string }`.

5. **Preview Dialog**: Use the new `<preview-dialog />` component for expanded preview experiences with integrated chat and search.

### Breaking Changes

- **DocFormat Metadata**: Components relying on `docformatMetadata()` returning a string will need updates to handle the new object structure.

- **Removed Routes**: Direct navigation to `/preview/:id` and `/ui-tester` will no longer work. Use the drawer-based preview or preview dialog instead.

## Dependencies Summary

### Major Version Updates

- Angular NGRX packages updated to v20
- Sinequa packages updated to latest versions

### Package Removals

- Remark-related packages (markdown processing)
- ngx-remark

### New Additions

- @types/markdown-it for TypeScript support

---

**Release Date**: November 29, 2025  
**Branch**: release/11.13.0  
**Base Branch**: dev/11

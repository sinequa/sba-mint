# Changelog

All notable changes to the SBA Mint project for release 11.13.0.

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

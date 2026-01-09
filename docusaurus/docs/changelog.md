---
title: Recents Changes
slug: /changelog
---

## Changelog

All notable changes to the SBA Mint project for release 11.13.0.

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
  - Integrated document list and upload components with delete capabilities

#### Assets

- **Custom Fonts**: Added HankenGrotesk font family
  - `HankenGrotesk-Regular.ttf`
  - `HankenGrotesk-SemiBold.ttf`
  - `HankenGrotesk-Bold.ttf`

- **Logo Assets**: Added new SVG logo files for consistent branding
  - `logo-sinequa.svg` and `logo-sinequa-blanc.svg` for Sinequa branded themes
  - `logo-small.svg` and `logo-small-blanc.svg` for compact display
  - `logo.svg` and `logo-blanc.svg` for standard display

#### Styling

- **Theme System Enhancement**: Significantly expanded CSS variable system
  - AI/Assistant colors: `--color-ai`, `--color-ai-light`, `--color-ai-dark`, `--color-ai-foreground`
  - Warning colors: `--color-warning`, `--color-warning-light`, `--color-warning-dark`, `--color-warning-foreground`
  - Info colors: `--color-info`, `--color-info-light`, `--color-info-dark`, `--color-info-foreground`
  - Error colors: `--color-error`, `--color-error-light`, `--color-error-dark`, `--color-error-foreground`
  - Backdrop styling: `--backdrop-blur`, `--backdrop-opacity`
  - Enhanced theme customization for all color themes (Chapsvision, Green, Orange, Sinequa, Teal, Violet, Yellow)

- **Logo Customization**: Added logo CSS variables to themes
  - `--logo-small-url`, `--logo-large-url`, `--logo-large-alt-url` for light mode
  - `--logo-dark-small`, `--logo-dark-large` for dark mode overrides
  - `--logo-alt-text` for accessibility

- **Chat UI**: Enhanced chat-related styles in `chat-v3.css`
  - Improved visual feedback for chat interactions
  - Fixed destructive button hover state using `oklch` color function

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

- **Environment**: Changed default app name in `environment.ts`
  - `app: 'training-mint'` → `app: 'mint_rnd'`

#### Documentation

- **Tokens Documentation**: Removed `APP_FEATURES` token documentation from `tokens.md`
  - Information now comprehensively covered in the new features section of `customization.mdx`

- **Changelog**: Updated changelog title for consistency and improved formatting

#### Component Refactoring

- **Preview System**: Major refactoring for improved modularity and maintainability
  - Simplified `preview.ts` by moving logic to specialized components
  - Enhanced `preview-tabs.ts` with better state management and assistant integration
  - Improved `preview-content.ts` for better content rendering and actions background styling
  - Updated `preview-header.html` and `preview-header.ts` for better UX
  - Refined `preview-dialog.html` and `preview-dialog.ts` for dialog interactions
    - Added assistant permission checking with `displaySummaryContent()` and `displayChatWithDocContent()`
    - Implemented automatic tab switching when assistants are disabled
  - Updated `preview-navbar` components for consistency

- **Search Components**: Enhanced search functionality
  - Improved `autocomplete.component` with better type handling and search suggestions
  - Enhanced `saved-search-popover` with refined interactions
  - Updated `search.component` with better state management and foreground text color

- **Layout Components**: Refined user interface components
  - Updated `app.component` with better structure and app features store integration
  - Enhanced `navbar.component` with improved styling
  - Refined `sidebar.component` for better navigation
  - Updated `user-menu` with dynamic language and theme menus
    - Added checkmark indicators for current selection
    - Refactored to use `AllLanguages` and `AllThemes` arrays
    - Improved component structure with `NgComponentOutlet` for flag icons

- **Assistant Components**: Improved assistant functionality
  - Enhanced `assistant.ts` with better integration
  - Refactored `assistant-upload.component` to use new upload dialog pattern
  - Improved `assistant.layout` with saved chat loading functionality
    - Added `handleLoadSavedChat()` method to populate query from saved chat history
    - Implemented assistant recreation on principal store changes
    - Enhanced integration with treepath aggregations

- **Home Page**: Updated home component structure
  - Improved layout and styling
  - Updated logo display to use content utility classes

- **Collections Widget**: Enhanced collections functionality
  - Added validation for empty collection names
  - Prevents creation of collections with whitespace-only names

#### Styling

- **Theme Organization**: Major refactoring of CSS variable structure
  - Moved 185+ lines of theme variables from `theme.css` to individual theme files
  - Each theme file now contains its complete color palette and configuration
  - Improved maintainability and theme customization
  - Logo variables now properly scoped per theme

- **Preview Styles**: Updated `preview.css` with enhanced styling
  - Better visual feedback for preview interactions
  - Actions now have proper background (`bg-muted/90`) for visibility

- **Global Styles**: Reorganized `styles.css`
  - Removed 185 lines of CSS moved to theme files
  - Better organization and maintainability

- **CSS Overrides**: Enhanced compatibility
  - Added missing `.fw-bold` utility class mapping to Tailwind's `font-bold`
  - Updated `saved-chat-v3.css` for better dark mode support

- **Search Input**: Added foreground text color class for better contrast

- **Line Endings**: Normalized `highlights.css` line endings (CRLF)

#### Scripts

- **Preview Script**: Enhanced `preview.js` with improved frameset handling
  - Better zoom functionality for nested iframes
  - Fixed iframe body element detection
  - Improved message passing for nested framesets
  - Enhanced highlighting for documents with framesets

### Removed

- **Documentation**: Removed redundant `APP_FEATURES` documentation from tokens.md
  - Information consolidated into customization.mdx features section

### Fixed

#### Preview Components

- **Dark Mode Styling**: Fixed preview action buttons dark mode text color
  - Changed from `dark:text-background` to `dark:text-white` for better visibility
  - Applied consistently across all preview action buttons

#### Scripts

- **Preview.js**: Fixed frameset document handling
  - Improved body element selection for documents with frameset structure
  - Better zoom factor calculation and application

### Migration Notes

#### For Developers

1. **Theming**: If you have custom themes, review the new CSS variables for AI, warning, info, and error colors. These provide better consistency across components. Theme variables are now organized per-theme rather than globally.

2. **Logo Configuration**: Use the new logo CSS variables in your theme files:

   ```css
   --logo-small-url: url('../assets/logo/your-logo-small.svg');
   --logo-large-url: url('../assets/logo/your-logo-large.svg');
   --logo-alt-text: 'Your Company Name';
   ```

3. **Fonts**: The application now includes HankenGrotesk as a custom font. Ensure your deployment includes the new font files from `src/assets/fonts/`.

4. **Features Configuration**: The features configuration documentation has moved to a dedicated section. Update any internal documentation references accordingly.

5. **Preview Components**: If you've extended preview components, review the refactored structure as logic has been reorganized into more specialized components.

6. **User Menu**: If you've customized the user menu, note the refactored structure using arrays for languages and themes with dynamic rendering.

7. **Environment Configuration**: Update your environment files if you're using the default app name - it has changed from `training-mint` to `mint_rnd`.

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

### Migration Notes

- **Angular 20.3.15**: This update includes bug fixes and performance improvements. No code changes required for existing implementations.
- **Sinequa Packages**: Updated packages may include new features or fixes - refer to their respective [changelogs](https://github.com/sinequa/sba-mint/blob/dev/11/CHANGELOG_SQ.md) for details.

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

**Latest Release Date**: December 19, 2025  
**Branch**: release/11.13.0  
**Base Branch**: dev/11

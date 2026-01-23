# Changelog

All notable changes to the SBA Mint project for release 11.13.0.

## [Release 11.13.0] - 2026-01-23

### Added

#### Search Features

- **Spelling Correction Mode**: Added support for URL-based spelling correction mode in search component
  - New `SpellingCorrectionMode` parameter synchronized with query params store
  - Enables proper browser back/forward navigation for spelling correction states
  - Improved search-all component to handle spelling correction mode selection

- **Reactive Search Filtering**: Added automatic search retriggering on filter changes
  - New effect monitors query params store for filter state changes
  - Automatically updates search results when filters are applied or modified
  - Implemented in home component for better search synchronization

#### Assistant Features

- **Principal Change Handling**: Enhanced assistant component recreation on principal changes
  - Assistant now automatically recreates when user principal changes
  - New chat is started automatically on principal change
  - Improved state management for multi-user scenarios

#### Documentation

- **Tabs Component Support**: Enhanced markdown documentation with Docusaurus Tabs component
  - Replaced custom tab syntax with standard Docusaurus Tabs
  - Added `tabs` and `tabitem` to allowed HTML elements in markdown linting
  - Improved multi-selection tutorial formatting
  - Moved `onBrokenMarkdownLinks` config to markdown hooks section

### Changed

#### Dependencies

- **Sinequa Packages**: Updated to latest versions
  - `@sinequa/atomic`: `^0.0.129` → `^0.0.132`
  - `@sinequa/atomic-angular`: `^0.3.15` → `^0.3.22`

- **Angular CLI**: Updated build tools
  - `@angular/cli`: `20.3.14` → `20.3.15`

- **npm Packages**: Updated dependencies for security and compatibility
  - `pacote`: `21.0.0` → `21.0.4`

- **Docusaurus Packages**: Updated documentation dependencies
  - Various Docusaurus plugins and dependencies updated in `docusaurus/package.json`

#### Component Refactoring

- **Assistant Component**: Simplified template and cleanup
  - Removed unnecessary `@for` loop wrapper and assistantKey tracking
  - Eliminated unused ChangeDetectorRef and PrincipalStore imports
  - Consolidated multi-line imports for better readability
  - Cleaned up principal store recreation code

- **Assistant Layout**: Improved component structure
  - Moved Aggregation component outside `@for` loop for single rendering
  - Added tracked `@for` loop to force recreation on principal changes
  - Better component lifecycle management

- **Preview Component**: Refactored loading states and validation logic
  - Introduced explicit loading state handling
  - Changed previewDataResource to use undefined as default value
  - Updated template to check loading and validation states separately
  - Removed canLoadIframe computed in favor of direct resource state checks
  - Validation resource now returns undefined on errors

- **Search Component**: Improved layout and warning handling
  - Moved SearchInputFooter outside dropdown for better layout control
  - Adjusted SearchInput padding from `p-2` to `p-0`
  - Replaced `console.warn` with `warn` utility from `@sinequa/atomic`
  - Removed unnecessary conditional class binding on footer
  - Cleaned up whitespace

- **Navbar Component**: Enhanced navigation with NgRx signals
  - Now uses `getState` from `@ngrx/signals` to retrieve stored search path
  - Improved navigation logic with fallback to '/search'
  - Reorganized imports alphabetically for consistency

#### Configuration

- **Git Ignore**: Added user-profile i18n assets to `.gitignore`
  - Excludes generated `/src/assets/i18n/user-profile` files from version control

- **Markdown Configuration**: Updated Docusaurus markdown settings
  - Moved markdown link configuration to hooks section
  - Updated linting rules to support tabs component

#### Documentation

- **Filter Button**: Removed outdated CSS variable tip from documentation
  - Cleaned up filter-button.md documentation

#### Styling

- **Theme Colors**: Added message reference color to Chapsvision theme
  - New CSS variable for message reference styling
  - Normalized line endings in highlights.css (CRLF to LF)

### Removed

- **Documentation**: Removed outdated CSS variable tip from filter-button component docs

### Fixed

#### Code Quality

- **Import Organization**: Improved import statements organization across multiple components
- **Template Optimization**: Reduced unnecessary template complexity in assistant component

### Migration Notes for This Release

- **Spelling Correction**: If you're using custom search implementations, review the new `SpellingCorrectionMode` parameter handling in search components.

- **Assistant Component**: The assistant now automatically recreates when the principal changes. If you've extended the assistant component, ensure your custom logic handles principal changes appropriately.

- **Preview Component**: Preview loading states are now handled more explicitly. If you've customized preview components, review the new loading and validation state management.

- **Search Filtering**: Search results now automatically update when filters change. Ensure this behavior aligns with your application's requirements.

### Breaking Changes

- None

---

## [Release 11.13.0] - 2026-01-09

### Changed

#### Dependencies

- **Sinequa Packages**: Updated to latest versions
  - `@sinequa/assistant`: `^3.10.4` → `^3.10.5`
  - `@sinequa/atomic-angular`: `^0.3.8` → `^0.3.15`
  - `@sinequa/ui`: `^0.2.3` → `^0.2.4`

### Documentation

- **Changelog**: Consolidated and updated changelog documentation for better clarity

### Migration Notes

- **Sinequa Packages**: Updated packages include bug fixes and enhancements - refer to their respective changelogs for details.

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

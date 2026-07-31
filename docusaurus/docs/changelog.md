---
title: Recents Changes
slug: /changelog
---

## Changelog

All notable changes to the SBA Mint project for release 11.13.0.

## [Release 11.13.0] - 2026-07-29

### Added

#### Document Preview

- `src/assets/preview.js` and `src/assets/preview.css` are taken over wholesale from the 11.14.0 line, because the passage-frame fix below is built on top of it. Three behaviours arrive with them that this release did not have:
  - styling for previews of converted videos (`.sq-mediav2-*`, the MediaToHtml v2 converter), including the click that enlarges a screenshot;
  - a `current-page` outbound message, emitted while scrolling a paginated document;
  - `description-visible`, which the fix itself needs (see below).

  All three are inert without the matching converter or consumer. Extracting them was not an option: the fix calls into them.
- The AI-description toggle now follows the iframe. When a cited passage lives inside a hidden AI page description, the preview reveals that block on its own and says so, and the toggle button reflects it instead of claiming the description is hidden.

### Changed

#### Document Preview

- **Advanced search is a floating panel** instead of a second column. It used to be part of the preview's grid, so opening it narrowed the iframe from the full width to two thirds — a resize of the previewed document, and therefore a reflow of it. On a large conversion that reflow costs seconds, so the panel opening alone could freeze the UI. It now slides in over the document, which keeps the iframe at its size and lays nothing out again. Same pattern as the search page's left filters drawer.
  - **Escape closes the panel** and leaves the preview open. Bound on `keydown` rather than `keyup`, so `preventDefault()` still cancels the default action — Escape inside the panel's search field would otherwise clear the field instead of closing the panel.
  - The collapsed panel is `inert`: out of the tab order and hidden from assistive technology, rather than merely translated off screen.
- Every change in this release is applied to **both** preview components it ships — `src/app/components/preview/` (the one the application bootstraps) and `src/components/preview/` — so the two stay in sync.

### Fixed

#### Document Preview

- **Passage frames (the blue box)**: repaired rather than removed. Six root causes, each found against a real captured document: coordinate spaces mixed between the overlay and the measurements, a single union rectangle spanning page and column breaks, citations pointing into hidden subtrees, a scroll request absorbed by the per-word `overflow: hidden` of PdfToHtml conversions, phantom frames from the previously selected passage, and fragments merged across a dense frame.
- **Large documents no longer freeze the browser**: a 15 MB conversion (447 920 tags) opened in 12.2 s and reported *not responding*; it now opens in under a second. A zoom step at that size went from 530 ms to 0.1 ms, a whole gesture from 2 343 ms to 13 ms, an extracts request of 20 000 ids from 3 min 44 s to 33 ms. Every preview also opens about half a second sooner, and `zoom-fit` no longer throws a `RangeError` on very large documents.
- **Extracts and entities are visible on OCR'd documents again** (ES-28511). The PdfToHtml family shows the scanned image of the page and puts the OCR text under it, every word carrying an inline `visibility: hidden` — and the highlight spans are nested *inside* those words, so they inherited the invisibility. A highlight could be scrolled to and show nothing at all. Two separate consequences, both fixed:
  - **Its colour.** The generated highlight rules now declare `visibility: visible`, which overrides what is inherited. This is scoped to the categories currently switched on: unchecking one drops its rule and the word goes back to hidden, so no part of the text layer is revealed that the reader did not ask for. Measured on a real `_PdfAdvanced` capture — a `geo` box of 131.5 × 17 px whose computed visibility was `hidden` — no `!important` is needed, the `hidden` sitting inline on the parent word rather than on the highlight itself.
  - **Its position.** Entity navigation scrolled to the right place and marked nothing there, including when the colours are legitimately switched off — the dashed outline was set on the element, so it inherited that same `visibility: hidden`. `select()` now draws the frame in `#sq-passage-layer`, an overlay that is a sibling of the body and therefore outside the hidden subtree, for anything having a box of its own, whoever requested the selection. Entity navigation lands on the marker extract navigation has always used rather than on a second one. A page anchor, which has no box to frame, keeps the dashed outline: framing it would draw nothing and still cost five render attempts and three seconds of repositioning on scroll.

### Breaking Changes

#### The preview component

- **The preview host no longer switches column templates.** Its class was
  `cn("grow w-full h-full overflow-hidden grid …", extended() ? "grid-cols-[1fr_.5fr]" : "grid-cols-[auto_0fr]")`
  and is now a static `grid grow h-full w-full overflow-hidden`; `<advanced-search>` moved from a
  sibling of the document into the floating `<aside>`. Custom CSS that targeted either the two-column
  layout or `advanced-search` as a direct child of the preview no longer matches.
- **The preview navbar's "search in document" no longer widens the drawer.** `toggle()` used to call
  `DrawerStackService.extend()` when the preview was rendered inside a drawer — that widening was the
  resize this change removes. It now toggles the floating panel in every context, and the unused
  `isExtended` computed was dropped from `PreviewNavbarComponent`.
- **Watch out for `overflow` on the iframe's ancestor chain.** Any `overflow` value there makes the
  element a scroll container, and the converter's fragment navigation inside the preview
  (`location.href = "#page"`, which is also how the next-page action works) scrolls it — a scroll that
  propagates out of the iframe and moves the host window, with no scrollbar to bring it back. The box
  that hides the collapsed panel is therefore deliberately a *sibling* of the document and uses
  `overflow-clip`, which forbids scrolling outright. The `overflow-hidden` already carried by the
  preview host and its root div predates this change and is left untouched.

:::danger Applies to anyone maintaining their own `src/assets/preview.js` or `src/assets/preview.css`
Both files were substantially rewritten. If you ship a modified copy, or style the preview from
your own stylesheet, read this list — several of these fail **silently**.
:::

#### `preview.css`

- **`#sq-passage-highlighter` is renamed `#sq-passage-layer`.** Custom styling attached to the old id no longer applies to anything.
- **The preview body's `transform`, `width` and `height` are now written inline by `preview.js`.** The declarations in `preview.css` are the *initial* state only, honouring the `--factor` the server writes inline so the document is scaled correctly at first paint. CSS you add for those three properties is overridden as soon as a zoom happens.
- **`--factor` is no longer updated after the first zoom.** It deliberately stays at the server's initial value: it is a custom property, so writing it invalidates style for the whole subtree — about 65 ms per zoom step on a 63 000-element document, against 1 ms for an inline transform. Any `calc(… / var(--factor))` in a custom rule now resolves against a **stale** factor, silently. Read the applied scale from the body's resolved `transform` instead.
- **`body.bd > div:not(.ph, .phe)` became `body.bd > div:not(.ph, .phe, #sq-passage-layer)`.** A rule copied from the old selector applies its `margin` to the passage overlay and shifts every frame by that amount — which is exactly the bug this exclusion fixes.
- **Off-screen content may now be skipped** (`content-visibility: auto` with `contain-intrinsic-height`), on the page sheets of image-based conversions and, through a new rule, on the top two levels of flowing conversions. Consequence for any custom script: a skipped subtree **has no layout**, so `getBoundingClientRect()` on it returns collapsed boxes and `body.scrollWidth` does not report the real content width. Measuring code must either work on rendered content or suspend the skipping first — `preview.js` does the latter in `withSkippingSuspended()`.

#### `preview.js` — the scale of it first

Nothing stops you from having modified any function in this file, so here is the honest
measure. Of the **29 functions that existed**, one survives byte-for-byte (`getBoundingBox`).
The rest: **5 removed, 23 rewritten**, and 44 new ones.

- **Rewritten** — grep your patch for these, a three-way merge will not land cleanly on any of them: `addSvgLine`, `createWorker`, `getElementsById`, `getHtml`, `getPositions`, `getText`, `getVerticalPositions`, `highlight`, `init`, `isElementInViewport`, `onMouseMove`, `onMouseUp`, `receiveMessage`, `removeAllClasses`, `removeAllElements`, `returnMessage`, `select`, `selectHighlight`, `selectHighlightSVG`, `setSvgBackgroundPositionAndSize`, `unselect`, `zoom`, `zoomFit`.
- **Removed, but not lost.** All five have a successor — no functionality was dropped, so if your patch sits on one of these, here is where its body went:

| Removed | Where its body went | What changed |
| --- | --- | --- |
| `resizeSvgBackground(rect, tspan)` | `measureSvgBackground(rect, tspan)`, plus the write loop in `setSvgBackgroundPositionAndSize()` | **Same arithmetic** — same `getBBox()`, `getExtentOfChar(0)` and `getComputedTextLength()`, same deltas, same four attributes, same `transform` copy. Only the writes moved out, so that reads and writes stop alternating per `tspan`: that interleaving was quadratic, 6 483 → 381 ms at 5 000 highlighted runs. It is renamed because it no longer resizes anything — it measures. |
| `selectPassage(elements)` | `getPassageLayer()`, `collectPassageRects()`, `groupPassageRects()`, `renderPassage()` | Rewritten. The old one created `#sq-passage-highlighter` and drew **one** union rectangle; the new path draws one frame per contiguous block. |
| `selectPassage2(elements)` | — (deliberately none) | It attached the overlay *inside* `elements[0]` with `position: relative`, which is exactly the coordinate-space mixing this ticket fixes. |
| `getHighlightTextById(id)` | `getText()`, through `collectElementsByIds()` | Folded into its caller: one document pass for all requested ids instead of one walk per id — 224 313 → 33 ms at 20 000 ids. |
| `getHighlightHtmlById(id)` | `getHtml()`, through `collectElementsByIds()` | Same. |

Some of those rewrites change behaviour a caller can observe, not just the implementation:

- `getHtml` / `getText` / `getPositions` collect their elements in **one** pass over the document instead of one walk per requested id. Same result, but the ids are no longer processed in request order internally.
- `getElementsById` no longer uses `querySelectorAll("#id")`, which could not use the browser's id table anyway since the converters emit duplicate ids.
- `unselect`, `removeAllClasses` and `removeAllElements` are called on paths that did not call them before, because a select now clears the previous passage's overlay.
- `onMouseMove` no longer emits `highlight-hover` synchronously: it coalesces to one emission per frame, trailing edge, with `position` measured at emission time. Enter/leave ordering is preserved.
- `createWorker` now clears `isWorkerSupported` from `worker.onerror`. A worker that 404s used to swallow every extracts request silently, because `new Worker()` does not throw on a missing script.
- **`ready` is a condition, not a delay.** It used to be emitted after a flat `setTimeout(…, 500)`; it now waits for two frames and `document.fonts.ready`, capped by a safety timeout. Code that relied on roughly half a second of slack after load may now race.
- **Messages are posted once.** `returnMessage()` used to post to both `parent` and `parent.parent`, so a top-level application received every message **twice**; it now posts to `parent.parent` only when that is a different window. A consumer that deduplicated by accident, or counted messages, will see half the traffic.
- **`zoom-fit` returns a different factor**, because the old computation mixed coordinate spaces and could leave the content overflowing at *fit* (0.79 where 0.34 was needed on a double-page PDF). Any workaround compensating for the old value will now over- or under-correct.
- **`stopImmediatePropagation()` is no longer called for every click** in the preview, only for a click on a video screenshot. Other click listeners registered on the preview document now actually run.

#### What did *not* change

The postMessage contract is backwards compatible: **no inbound action and no outbound message type was removed.** The inbound actions this release already handled are handled identically. Three outbound types are added: `description-visible`, `get-html-results-webworker`, and `current-page`.

### Migration Notes

- If you only *use* the preview, nothing to do.
- If you style it, search your stylesheets for `sq-passage-highlighter`, for `--factor`, for rules on the preview body's `transform`/`width`/`height`, and for anything targeting the preview's two-column layout or `advanced-search` as its direct child.
- If you script against the preview document, search for geometry read on content that may be off screen.
- If you maintain a modified `preview.js`, treat this as a rewrite rather than a merge: the zoom path, the passage overlay, the scroll handler and the extracts path all changed shape.

---

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

**Latest Release Date**: January 9, 2026  
**Branch**: release/11.13.0  
**Base Branch**: dev/11

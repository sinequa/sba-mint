# sinequa-mint

## 11.14.0-4

_Dernier build ES connu à la génération : es-11.14.0.2180 (indicatif, non garanti pour ce commit précis)._

### Patch Changes

- 087c96a: Send only the value in the body of user profile PATCH requests, instead of repeating the full `data`/`customData` hierarchy.
- ac6c06a: Fix the slide card showing the source icon twice when the document has no thumbnail: the icon is now displayed only in the thumbnail placeholder, and the selection badge only shows the checkbox on hover.
- ac6c06a: Fix custom source logos (`iconPath`) being displayed at their native size: upgrade `@sinequa/atomic-angular` to 1.18.2, which sizes them from the surrounding font size.

## 11.14.0-3

_Dernier build ES connu à la génération : es-11.14.0.2176 (indicatif, non garanti pour ce commit précis)._

### Patch Changes

- 5a18f35: Fix the user override still being lost when launching a search by clicking the send button (or the clear / saved-search buttons): the search form no longer submits natively, so the page no longer reloads after navigating to the results.

## 11.14.0-2

_Dernier build ES connu à la génération : es-11.14.0.2169 (indicatif, non garanti pour ce commit précis)._

### Patch Changes

- d58ab56: Fix the broken visual rendering of the new Agent page by loading the Galactik design tokens in both light and dark themes.
- 212eafd: Fix the Agent page prompt dialogs (delete saved chat, rename, like, dislike) being displayed at the top-left of the screen without a backdrop: import `@sinequa/agent/css/utilities.css` so the `agt-*` utilities are defined.

## 11.14.0-1

_Dernier build ES connu à la génération : es-11.14.0.2154 (indicatif, non garanti pour ce commit précis)._

### Minor Changes

- 33ad3f9: Add mouse pan (middle-click drag) and zoom (Ctrl/Cmd+wheel, anchored under the cursor) to the document preview. Also fixes a pre-existing bug where the preview's horizontal scrollbar could disappear and the document could get stuck unscrollable left/right past a certain zoom level.

### Patch Changes

- fffa62e: Hide the "Agent Debug" toggle on mobile and iPad viewports, where the debug popup can't open, and force debug mode off in the agent's runtime store on those viewports even if it was previously enabled on desktop.
- 6ea62fd: Fix the user override being lost when launching a search with the Enter key: the page no longer reloads after navigating to the results.

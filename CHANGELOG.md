# sinequa-mint

## 11.14.0-1

_Dernier build ES connu à la génération : es-11.14.0.2154 (indicatif, non garanti pour ce commit précis)._

### Minor Changes

- 33ad3f9: Add mouse pan (middle-click drag) and zoom (Ctrl/Cmd+wheel, anchored under the cursor) to the document preview. Also fixes a pre-existing bug where the preview's horizontal scrollbar could disappear and the document could get stuck unscrollable left/right past a certain zoom level.

### Patch Changes

- fffa62e: Hide the "Agent Debug" toggle on mobile and iPad viewports, where the debug popup can't open, and force debug mode off in the agent's runtime store on those viewports even if it was previously enabled on desktop.
- 6ea62fd: Fix the user override being lost when launching a search with the Enter key: the page no longer reloads after navigating to the results.

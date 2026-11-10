---
title: Multi Selection Toolbar
---

The `MultiSelectionToolbarComponent` provides a contextual toolbar that appears at the bottom of the screen when a user selects multiple items.
It offers a range of actions, such as clearing the selection, adding items to a collection, exporting them, or sending them to an AI assistant for further processing.

The toolbar is designed to be non-intrusive, appearing only when needed and providing quick access to common multi-select actions.

## Features

- **Contextual Visibility**: Automatically appears when at least one item is ticked and hides when the selection is cleared.
- **Dynamic Item Count**: Clearly displays the number of currently selected items.
- **One-Click Actions**:
  - **Clear Selection**: Instantly deselect all items.
  - **Collections**: Opens the collection management dialog.
  - **Export**: Opens the export dialog.
  - **Send to AI**: Attaches the selected items to the AI assistant for analysis (this feature is conditioned by `modeSettings.enabledUserInput`).
- **Customizable Appearance**: Comes with multiple visual themes (`dark`, `light`, `glassy`) to match different application styles.
- **Smooth Animations**: Uses CSS transitions for a smooth appearance and disappearance effect.

## API Reference

### Inputs

| Property    | Type                                              | Description                                                                                        |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `className` | `Input<string>`                                   | Optional CSS classes to apply custom styles to the toolbar.                                        |
| `variant`   | `Input<MultiSelectionToolbarVariants['variant']>` | The visual theme of the toolbar. Accepts `'dark'`, `'light'`, or `'glassy'`. Defaults to `'dark'`. |

### Methods

| Method                   | Description                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `clearSelection()`       | Invokes the `SelectionStore` to clear the current multi-selection, causing the toolbar to hide. |
| `openCollectionDialog()` | Opens the `CollectionsDialog` via the `DialogService`, passing the currently selected items.    |
| `openExportDialog()`     | Opens the `ExportDialog` via the `DialogService`, passing the IDs of the selected items.        |
| `attachToAssistant()`    | Updates the `SelectionStore` to attach the selected item IDs to the AI assistant.               |

## Usage

To integrate the toolbar, simply add the `<MultiSelectionToolbar>` tag to your component's template. It works out-of-the-box with the `SelectionStore`.

### Default (Dark) Variant

```ts
import { MultiSelectionToolbarComponent } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-search',
  imports: [MultiSelectionToolbarComponent],
  template: `
    <!-- Other components -->
    <MultiSelectionToolbar />
  `
})
export class SearchComponent {}
```

### Light Variant

To use the light theme, set the `variant` input to `'light'`.

```html
<MultiSelectionToolbar variant="light" />
```

### Glassy Variant

The glassy variant provides a semi-transparent, blurred background effect.

```html
<MultiSelectionToolbar variant="glassy" />
```

## Styling and Animation

The component uses `class-variance-authority` (CVA) to manage its visual variants. The base styles and variants are defined in `multiSelectionToolbarVariants`.

Animations are handled via CSS transitions on the `opacity` and `transform` properties. The component smoothly slides up from the bottom of the screen and fades in when `count()` is greater than 0.

- **Host Classes**: `fixed bottom-[-40px] left-[50%] translate-x-[-50%] z-50 transition-[translate,opacity,discrete] duration-300 opacity-0`
- **Active State Classes**: `opacity-100 -translate-y-14` (applied when `count() > 0`)

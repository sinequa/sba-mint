---
title: Source
---

## Overview

The `SourceComponent` displays an icon representing the source or collection of a document. It automatically selects the appropriate icon or image based on the provided collection and connector, using the application's source configuration.

## Features

- Displays a source icon or image for a given collection or connector
- Automatically resolves the icon from the application's source configuration
- Supports both font icons and custom image paths
- Fully standalone and can be used in any Angular template

## Inputs

- `collection` (optional): An array of strings representing the collection path (e.g., `["collection/myCollection"]`)
- `connector` (optional): The connector name (string)

## Usage

```html
<source [collection]="['collection/myCollection']" [connector]="'myConnector'" />
```

## Example

```ts
@Component({
  selector: 'my-component',
  template: `
    <source [collection]="['collection/myCollection']" [connector]="'myConnector'" />
  `,
  imports: [SourceComponent]
})
export class MyComponent {}
```

## Notes

- If a custom icon path is available, it will be displayed as an image; otherwise, a font icon is shown.
- The component uses the application's source configuration to resolve the icon.

## Schema

```mermaid
flowchart TD
    A[Inputs: collection, connector] -->|Resolve source info| B[SourceComponent]
    B -->|Get source config| C[AppStore]
    C -->|Return iconClass or iconPath| D[iconDetails]
    D -->|Display| E{iconPath?}
    E -- Yes --> F[Show image]
    E -- No --> G[Show font icon]
```

- The component receives `collection` and/or `connector` as inputs.
- It queries the application's source configuration via AppStore to resolve the appropriate icon.
- If a custom icon path is found, it displays an image; otherwise, it shows a font icon.

## Store Interaction Schema

```mermaid
flowchart TD
    A[SourceComponent]
    B[AppStore]
    A -- injects --> B
    A -- calls --> C[get sources]
    C -- returns --> D[CSources config]
    D -- used by --> E[iconDetails computed]
    E -- provides --> F[iconClass/iconPath]
    F -- used for --> G[Rendering icon or image]
```

- The component injects `AppStore` to access the application's source configuration.
- It calls `sources()` from the store to get the `CSources` config.
- The `iconDetails` computed property uses this config to determine the correct icon or image.
- The result is used to render either an image or a font icon in the template.

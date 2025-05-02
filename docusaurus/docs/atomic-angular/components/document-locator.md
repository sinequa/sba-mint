---
title: Document Locator
---

## Overview

The `DocumentLocator` component is an Angular component displaying properly the location of a document.

### Properties

| Property      | Type                      | Description                                                                                             |
|---------------|---------------------------|---------------------------------------------------------------------------------------------------------|
| `article`  | `Input<Article>`         | The article to display the location of.                                                                          |
| `aggregation`   | `Input<string>`          | The name of the aggregation to use for the document locator.                                                                              |
| `locationSegments`    | `Signal<string[]>`                | All segments found from the article's `treepath` property.                                   |
| `visibleSegments`    | `Signal<string[]>`                | Segments that are visible on the viewport.                                   |
| `invisibleSegments`    | `Signal<string[]>`                | Segments that cannot be shown on the viewport because of the available space.                                   |

## Examples

The `DocumentLocatorComponent` can be used in the template of a parent component as follows:

```html
<DocumentLocator [article]="article()" aggregation="Treepath" />
```

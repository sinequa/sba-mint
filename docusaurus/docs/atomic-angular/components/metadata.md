---
title: Metadata
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview

The `Metadata` component is an Angular component that displays metadata in a badge format.

### Properties

| Property   | Type                                       | Description                                                                                             |
|------------|--------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `click`    | `Output<{ field: string; value: string }>` | Emits an event with the field and value when the metadata badge is clicked.                            |
| `class`    | `string`                                   | Additional CSS classes to add to the metadata badge.                                                    |
| `variant`  | `Input<BadgeVariants['variant']>`          | Variant for the badge styling (e.g., `'outline'`, `'primary'`).                                         |
| `article`  | `Input<Article>`                           | The `Article` object from which to display metadata.                                                    |
| `metadata` | `Input<KeyOf<Article>>`                    | The key (property name) of the `Article` object representing the metadata to display (e.g., `'docformat'`). |
| `items`    | `Signal<{display: string}>`                | The list of metadata values fetched for the specified `metadata` key.                                   |

### Methods

| Method        | Signature   | Description                      |
|---------------|-------------|----------------------------------|
| `handleClick` | `(): void`  | Emits the `click` output event.  |

## Examples

The `MetadataComponent` can be used in the template of a parent component as follows:

<Tabs>
<TabItem value="basic" label="Basic">

Displays the `docformat` metadata for the given article.

```html
<Metadata [article]="article()" metadata="docformat" />
```

</TabItem>
<TabItem value="customized" label="Customized">

Displays the `docformat` metadata with outline styling, additional CSS classes, and handles click events.

```html
<Metadata
    variant="outline"
    class="cursor-pointer"
    [article]="article()"
    metadata="docformat"
    (click)="onClick($event)" />
```

</TabItem>
</Tabs>

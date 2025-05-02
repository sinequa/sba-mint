---
title: Source
---

## Overview

The `Source` component is an Angular component that properly displays the icon for a data source.

### Properties

| Property      | Type                      | Description                                                                                             |
|---------------|---------------------------|---------------------------------------------------------------------------------------------------------|
| `collection`  | `Input<string[]>`         | The source collection name(s).                                                                          |
| `connector`   | `Signal<string>`          | The source connector name.                                                                              |
| `iconDetails` | `Signal<{ iconClass: string; iconPath?: string }>` | Details for the source icon (CSS class and optional path), calculated based on the `collection` and `connector` inputs. |

## Examples

The `SourceComponent` can be used in the template of a parent component using properties from an article object, as follows:

```html
<source [collection]="article().collection" [connector]="article().connector" />
```

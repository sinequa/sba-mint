---
title: ThemeSelector
---

## Overview

The `ThemeSelector` component is an Angular component that displays a list of available themes and allows users to switch between them.

### Properties

| Property        | Type                      | Description                                                   |
|-----------------|---------------------------|---------------------------------------------------------------|
| `scope`         | `Input<string>`           | The application scope identifier used for theme management.   |
| `showPrivate`   | `Input<boolean>`          | Whether to display themes marked as private.                  |
| `themes`        | `Signal<Object>`          | The list of available themes.                                 |
| `selectedTheme` | `Model<string>`           | The name of the currently selected theme.                     |

### Methods

| Method          | Description                      |
|-----------------|----------------------------------|
| `selectTheme`   | Selects a different theme.       |

## Examples

The `ThemeSelectorComponent` can be used in the template of a parent component as follows:

```html
<theme-selector [scope]="scope" />
```

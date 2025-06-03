---
title: ThemeToggle
---

## Overview

The `ThemeToggle` component is an Angular component that allows toggling between dark and light mode.

### Properties

| Property   | Type                | Description                               |
|------------|---------------------|-------------------------------------------|
| `scope`    | `Input<string>`     | The application scope.                    |
| `darkMode` | `Model<boolean>`    | Indicates whether dark mode is enabled.   |

### Methods

| Method             | Description                                  |
|--------------------|----------------------------------------------|
| `toggleDarkMode`   | Toggles between dark and light mode.         |

## Examples

The `ThemeToggleComponent` can be used in the template of a parent component as follows:

```html
<theme-toggle [scope]="scope" />
```

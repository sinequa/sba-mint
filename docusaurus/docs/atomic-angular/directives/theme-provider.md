---
title: ThemeProvider
---

## Overview

Directive that applies a theme to a native element based on the theme scope.

### Usage

```html
<div themeProvider="myThemeScope"></div>
```

- Requires a `themeProvider` input (string, the theme scope key)
- Applies the theme variables to the host element using the ThemeStore.

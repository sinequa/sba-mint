---
title: ThemeProvider
---

### Overview

The `ThemeProviderDirective` takes in argument a scope name. It looks for the associated theme name from the `ThemeStore` and apply the CSS variable to on DOM element the directive is attached to. That means every child element will inherit from the theme, but also that you can nest theme.

### Properties

| Property        | Description                                       |
| --------------- | ------------------------------------------------- |
| `themeProvider` | Name of the theme to use for that node of the DOM |

### Usage

```html
<div themeProvider="ruby">
  <div themeProvider="emerald">
    <span class="primary">This will be green.</span>
  </div>

  <div themeProvider="saphir">
    <span class="primary">This will be blue.</span>

    <div themeProvider="ruby">
      <span class="primary">This will be red again.</span>
    </div>
  </div>

  <span class="primary">This will be red.</span>
</div>
```
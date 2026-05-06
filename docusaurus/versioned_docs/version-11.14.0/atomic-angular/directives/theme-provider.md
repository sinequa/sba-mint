---
title: ThemeProvider
---

The `ThemeProviderDirective` applies a theme to its host element by resolving CSS variables from the `ThemeStore` for the given scope name.

## Usage

```html
<div themeProvider="ruby">...</div>
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `themeProvider` | `string` | ✓ | The scope name used to look up the theme in `ThemeStore`. |

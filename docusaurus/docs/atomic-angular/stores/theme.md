---
title: Theme
sidebar_class_name: update
---

The `ThemeStore` loads and manages themes, handles scope-based theme assignment, and applies CSS variables to the DOM.
See [Theme](../theme) for a conceptual overview.

## Methods

### `loadDefaultTheme()`

Loads the default theme for a given scope.

```typescript
loadDefaultTheme(scope: string, darkMode?: boolean): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `scope` | `string` | ✓ | The scope identifier for which to load the default theme. |
| `darkMode` | `boolean` | | Whether to enable dark mode. |

**Example**

```typescript
inject(ThemeStore).loadDefaultTheme('main', true);
```

### `setCurrentTheme()`

Switches the active theme for a given scope.

```typescript
setCurrentTheme(scope: string, themeName: string, darkMode?: boolean): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `scope` | `string` | ✓ | The scope identifier. |
| `themeName` | `string` | ✓ | The name of the theme to apply. |
| `darkMode` | `boolean` | | Whether to enable dark mode. |

**Example**

```typescript
inject(ThemeStore).setCurrentTheme('main', 'ruby', true);
```

### `setDarkMode()`

Toggles dark mode for a given scope.

```typescript
setDarkMode(scope: string, darkMode: boolean): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `scope` | `string` | ✓ | The scope identifier. |
| `darkMode` | `boolean` | ✓ | `true` to enable dark mode. |

**Example**

```typescript
inject(ThemeStore).setDarkMode('main', true);
```

### `processCssVars()`

Processes and returns the CSS variables object for a given theme name.

```typescript
processCssVars(themeName: string): CssVars
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `themeName` | `string` | ✓ | The theme name to process. |

**Returns** `CssVars` — the CSS variables for that theme.

### `applyThemeToNativeElement()`

Applies theme CSS variables directly to an HTML element.

```typescript
applyThemeToNativeElement(element: HTMLElement, cssVars?: Record<string, string>): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `element` | `HTMLElement` | ✓ | The DOM element to apply the theme to. |
| `cssVars` | `Record<string, string>` | | CSS variable overrides. |

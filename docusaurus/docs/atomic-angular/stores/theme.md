---
title: Theme
---

## Overview
This document provides an overview of the `ThemeStore` and its methods.  
See [Theme](../theme) for more information.


### loadDefaultTheme()

Loads the default theme for a given scope.

```typescript
loadDefaultTheme(scope: string, darkMode?: boolean): void
```


| Parameter | Type      | Description                      |
|-----------|-----------|----------------------------------|
| scope     | `string`  | The scope for the theme.         |
| darkMode  | `boolean` | Optional. Enable dark mode.      |

**Usage Example:**
```typescript
ThemeStore.loadDefaultTheme('main', true);
```

### setCurrentTheme()

Sets the current theme for a given scope.

```typescript
setCurrentTheme(scope: string, themeName: string, darkMode?: boolean): void
```


| Parameter | Type      | Description                      |
|-----------|-----------|----------------------------------|
| scope     | `string`  | The scope for the theme.         |
| themeName | `string`  | The name of the theme.           |
| darkMode  | `boolean` | Optional. Enable dark mode.      |

**Usage Example:**
```typescript
ThemeStore.setCurrentTheme('main', 'DarkTheme', true);
```

### setDarkMode()

Sets the dark mode for a given scope.

```typescript
setDarkMode(scope: string, darkMode: boolean): void
```


| Parameter | Type      | Description                      |
|-----------|-----------|----------------------------------|
| scope     | `string`  | The scope for the theme.         |
| darkMode  | `boolean` | Enable or disable dark mode.     |

**Usage Example:**
```typescript
ThemeStore.setDarkMode('main', true);
```

### processCssVars()

Processes the CSS variables for a given theme name.

```typescript
processCssVars(themeName: string): CssVars
```


| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| themeName | `string` | The name of the theme.   |

**Usage Example:**
```typescript
const cssVars = processCssVars('DarkTheme');
```

### themeColorsToCssVariables()

Converts theme colors to CSS variables.

```typescript
themeColorsToCssVariables(colors: any): any
```


| Parameter | Type  | Description              |
|-----------|-------|--------------------------|
| colors    | `any` | The theme colors object. |

**Usage Example:**
```typescript
const cssVars = themeColorsToCssVariables(theme.colors);
```

### themeColorNameToCssVariable()

Converts a theme color name to a CSS variable name.

```typescript
themeColorNameToCssVariable(name: string): string
```


| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| name      | `string` | The name of the color.   |

**Usage Example:**
```typescript
const cssVarName = themeColorNameToCssVariable('primaryColor');
```

### applyThemeToNativeElement()

Applies the theme CSS variables to a native HTML element.

```typescript
applyThemeToNativeElement(element: HTMLElement, cssVars?: Record<string, string>): void
```


| Parameter | Type                      | Description                      |
|-----------|---------------------------|----------------------------------|
| element   | `HTMLElement`             | The HTML element.                |
| cssVars   | `Record<string, string>`  | Optional. The CSS variables.     |

**Usage Example:**
```typescript
applyThemeToNativeElement(document.body, cssVars.light);
```
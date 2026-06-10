---
title: Highlights
sidebar_class_name: update
---

The `HIGHLIGHTS` injection token provides an array of `PreviewHighlight` objects used to configure highlight colors in the document preview. It ships with five pre-configured highlights that can be overridden via dependency injection.

## Types

### `PreviewHighlightName`

A union type restricting highlight names to predefined values.

```typescript
type PreviewHighlightName = 'company' | 'geo' | 'person' | 'extractslocations' | 'matchlocations';
```

### `PreviewHighlight`

Describes a single highlight configuration.

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `name` | `PreviewHighlightName` | ✓ | The highlight category name. |
| `color` | `string` | ✓ | The text color. |
| `bgColor` | `string` | ✓ | The background color. |

## Token

### `HIGHLIGHTS`

An `InjectionToken<PreviewHighlight[]>` with a built-in factory providing default colors.

**Default values**

```typescript
import { HIGHLIGHTS } from '@sinequa/atomic-angular';

export const HIGHLIGHTS = new InjectionToken<PreviewHighlight[]>('highlights', {
  factory: () => [
    { name: 'company',          color: 'white', bgColor: '#FF7675' },
    { name: 'geo',              color: 'white', bgColor: '#74B9FF' },
    { name: 'person',           color: 'white', bgColor: '#00ABB5' },
    { name: 'extractslocations',color: 'black', bgColor: '#fffacd' },
    { name: 'matchlocations',   color: 'black', bgColor: '#ff0'    },
  ],
});
```

**Override example**

```typescript title="app.config.ts"
import { HIGHLIGHTS } from '@sinequa/atomic-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: HIGHLIGHTS, useValue: [
      { name: 'matchlocations', color: 'black', bgColor: '#ffd700' },
    ]},
  ],
};
```

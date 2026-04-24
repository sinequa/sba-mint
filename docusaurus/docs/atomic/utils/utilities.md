---
title: Help Resources
---

This module provides utilities for resolving locale-aware help file URLs. It is useful for applications that serve their help documentation in multiple languages.

## Types

### `HelpFolderOptions`

Options for resolving the help folder and index file path.

```typescript
type HelpFolderOptions = {
  path: string;
  folder?: string;
  indexFile?: string;
  useLocale?: boolean;
  useLocaleAsPrefix?: boolean;
};
```

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `path` | `string` | ✓ | Base path for the help folder |
| `folder` | `string` | | Subfolder name |
| `indexFile` | `string` | | Name of the help index file |
| `useLocale` | `boolean` | | If `true`, prefix the file path with the locale (e.g. `en-US/`) |
| `useLocaleAsPrefix` | `boolean` | | If `true`, prefix the filename with the locale (e.g. `en-US.index.html`) |

## Functions

### `getHelpIndexUrl()`

Resolves the help index file URL based on the current locale and options.

```typescript
function getHelpIndexUrl(locale: string, options: HelpFolderOptions): string
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `locale` | `string` | ✓ | BCP 47 locale code (e.g. `'en-US'`) |
| `options` | `HelpFolderOptions` | ✓ | Folder and file resolution options |

**Returns** `string` — resolved URL path to the help index file.

**Example**

```typescript title="get-help-index-url.ts"
import { getHelpIndexUrl } from '@sinequa/atomic';

// With locale as folder prefix
getHelpIndexUrl('en-US', {
  path: 'help',
  folder: 'docs',
  indexFile: 'index.html',
  useLocale: true
});
// 'help/docs/en-US/index.html'

// With locale as filename prefix
getHelpIndexUrl('fr-FR', {
  path: 'help',
  indexFile: 'index.html',
  useLocaleAsPrefix: true
});
// 'help/fr-FR.index.html'
```

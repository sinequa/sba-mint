---
title: Utilities
---

## Introduction

This module provides utility types and functions for working with help/documentation folders and locale-based file resolution.

## Types

### HelpFolderOptions

Options for resolving help folder and index file paths.

```typescript
export type HelpFolderOptions = {
  path: string;
  folder?: string;
  indexFile?: string;
  useLocale?: boolean;
  useLocaleAsPrefix?: boolean;
};
```

| Property            | Type      | Description                                                                 |
|---------------------|-----------|-----------------------------------------------------------------------------|
| `path`              | `string`  | The base path for the help folder                                           |
| `folder`            | `string?` | The name of the folder (optional)                                           |
| `indexFile`         | `string?` | The name of the index file (optional)                                       |
| `useLocale`         | `boolean?`| If true, the locale will be used to determine the folder to use (optional)   |
| `useLocaleAsPrefix` | `boolean?`| If true, the locale will be used as a prefix for the help folder (optional)  |

## Functions

### getHelpIndexUrl

Resolves the help index file URL based on locale and options.

```typescript
function getHelpIndexUrl(locale: string, options: HelpFolderOptions): string
```

#### Parameters

| Parameter | Type                | Description                                 |
|-----------|---------------------|---------------------------------------------|
| `locale`  | `string`            | The locale to use (e.g., 'en-US')           |
| `options` | `HelpFolderOptions` | Options for folder and file resolution       |

#### Returns

| Type      | Description                                 |
|-----------|---------------------------------------------|
| `string`  | The resolved help index file URL             |

#### Example

```typescript
import { getHelpIndexUrl } from '@sinequa/atomic';

const url = getHelpIndexUrl('en-US', {
  path: 'help',
  folder: 'docs',
  indexFile: 'index.html',
  useLocale: true
});
// url: 'help/docs/en-US/index.html'
```

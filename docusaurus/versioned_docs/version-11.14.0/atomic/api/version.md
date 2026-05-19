---
title: Version
sidebar_class_name: new
---

The Version module (v2 API) provides a function to retrieve the server version and its enabled feature flags.

## Types

### `VersionResponse`

```typescript
type VersionResponse = {
  serverVersion: string;
  features: Record<string, boolean>[];
};
```

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `serverVersion` | `string` | ✓ | The version string of the Sinequa server |
| `features` | `Record<string, boolean>[]` | ✓ | List of feature flags and their enabled state |

## Functions

### `fetchVersion()`

Fetches the current server version and available feature flags.

**Returns** `Promise<VersionResponse>` — server version and feature flags.

**Example**

```typescript title="fetch-version.ts"
import { fetchVersion } from '@sinequa/atomic';

const { serverVersion, features } = await fetchVersion();
console.log('Server version:', serverVersion);
console.log('Features:', features);
```

---
title: withFetch
sidebar_class_name: new
---

`withFetch` wraps an async callback in Angular's injection context and transparently handles common HTTP error responses. `401` errors redirect to the login page; `404` errors return `undefined` silently.

## API

```typescript
withFetch<T>(callback: () => Promise<T>, injector?: Injector): Promise<T | undefined>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `callback` | `() => Promise<T>` | ✓ | The async operation to execute. |
| `injector` | `Injector` | | An optional Angular injector. When omitted, the current injection context is used. |

**Returns** `Promise<T | undefined>` — the resolved value, or `undefined` if a `404` was thrown.

## Example

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { withFetch } from '@sinequa/atomic-angular';

const data = await withFetch(() => fetch('/api/resource').then(r => r.json()));
```

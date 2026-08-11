---
title: setToken
---

Saves a CSRF token into session storage under the `sinequa-credentials` key.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `token` | `string` | ✓ | The CSRF token to store |

**Returns** `void`

**Example**

```typescript title="set-token.ts"
import { setToken } from '@sinequa/atomic';

setToken('my-csrf-token-value');
```

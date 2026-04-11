---
title: Principal
sidebar_class_name: update
sidebar_position: 2
---

This module provides functions for retrieving user (principal) information from the backend. It supports fetching the current user, searching users by criteria, and looking up users by their IDs.

## Types

### `Principal`

<details>
<summary>Principal type definition</summary>

```typescript
type Principal = {
  id: string;
  id2: string;
  id3: string;
  id4: string;
  id5: string;
  name: string;
  email: string;
  description: string;
  longName: string;
  userId: string;
  fullName: string;
  isAdministrator: boolean;
  isDelegatedAdmin: boolean;
  param1: string;
  param2: string;
  param3: string;
  param4: string;
  param5: string;
  param6: string;
  param7: string;
  param8: string;
  param9: string;
  param10: string;
};
```
</details>

### `ListOptions`

```typescript
type ListOptions = {
  search?: string;
  isuser?: boolean;
  isgroup?: boolean;
};
```

| Property | Type | Description |
|----------|------|-------------|
| `search` | `string` | Text to search for in principal names |
| `isuser` | `boolean` | Filter to users only |
| `isgroup` | `boolean` | Filter to groups only |

## Functions

### `fetchPrincipal()`

Fetches the current authenticated user's principal information.

**Returns** `Promise<Principal>` — the current user's principal object.

**Example**

```typescript title="fetch-principal.ts"
import { fetchPrincipal } from '@sinequa/atomic';

const principal = await fetchPrincipal();
console.log(principal.fullName);
console.log(principal.isAdministrator);
```

---

### `fetchPrincipalList()`

Fetches a list of principals matching the provided search options.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `options` | `ListOptions` | ✓ | Filter options to narrow the principal list |

**Returns** `Promise<Principal[]>` — array of matching principal objects.

**Example**

```typescript title="fetch-principal-list.ts"
import { fetchPrincipalList } from '@sinequa/atomic';

// Search for users named 'john'
const users = await fetchPrincipalList({ search: 'john', isuser: true });
users.forEach(u => console.log(u.fullName));

// Search for groups only
const groups = await fetchPrincipalList({ isgroup: true });
```

---

### `fetchPrincipalUserid()`

Fetches a single principal by their `Domain|ID` identifier.

:::info
The `userid` parameter follows the Sinequa format `Domain|ID` (e.g. `'ACME|jdoe'`).
:::

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userid` | `string` | ✓ | The principal identifier in `Domain|ID` format |

**Returns** `Promise<Principal>` — the principal matching the given user ID.

**Example**

```typescript title="fetch-principal-userid.ts"
import { fetchPrincipalUserid } from '@sinequa/atomic';

const user = await fetchPrincipalUserid('ACME|jdoe');
console.log(user.email);
```

---

### `fetchPrincipalUserids()`

Fetches multiple principals by an array of user IDs.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userids` | `string[]` | ✓ | Array of user IDs in `Domain|ID` format. Must not be empty. |

**Returns** `Promise<Principal[]>` — array of principals corresponding to the provided IDs.

**Example**

```typescript title="fetch-principal-userids.ts"
import { fetchPrincipalUserids } from '@sinequa/atomic';

const principals = await fetchPrincipalUserids(['ACME|jdoe', 'ACME|jsmith']);
principals.forEach(p => console.log(p.fullName));
```

---
title: User Settings
sidebar_position: 3
---

This module provides functions to manage user settings on the backend. User settings are typed via a generic parameter, allowing full type safety for custom settings schemas.

## Functions

### `fetchUserSettings<T>()`

Fetches the current user's settings from the backend.

**Returns** `Promise<T>` — the user settings object.

**Example**

```typescript title="fetch-user-settings.ts"
import { fetchUserSettings } from '@sinequa/atomic';

type MySettings = {
  bookmarks: Bookmark[];
  recentSearches: RecentSearch[];
  savedSearches: SavedSearch[];
};

const settings = await fetchUserSettings<MySettings>();
console.log(settings.bookmarks);
```

---

### `saveUserSettings<T>()`

Replaces the user's settings entirely.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userSettings` | `T` | ✓ | The complete user settings object to save |
| `audit` | `AuditEvents` | | Audit event to record with the save action |

**Returns** `Promise<void>`

**Example**

```typescript title="save-user-settings.ts"
import { saveUserSettings } from '@sinequa/atomic';

await saveUserSettings({ flag: true, bookmarks: [] });
console.log('Settings saved.');
```

---

### `patchUserSettings<T>()`

Partially updates the user's settings, merging the provided object with existing settings.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userSettings` | `Partial<T>` | ✓ | The settings properties to update |
| `audit` | `AuditEvents` | | Audit event to record with the update action |

**Returns** `Promise<T>` — the updated settings object.

**Example**

```typescript title="patch-user-settings.ts"
import { patchUserSettings } from '@sinequa/atomic';

// Existing settings: { flag: false, bookmarks: [{ id: 1 }] }
const updated = await patchUserSettings({ flag: true });
// Result: { flag: true, bookmarks: [{ id: 1 }] }
console.log(updated.flag); // true
```

---

### `deleteUserSettings()`

Resets the user's settings to their default state by saving an empty object.

:::warning
This operation is irreversible and deletes all stored user settings.
:::

**Returns** `Promise<void>`

**Example**

```typescript title="delete-user-settings.ts"
import { deleteUserSettings } from '@sinequa/atomic';

await deleteUserSettings();
console.log('User settings have been reset.');
```

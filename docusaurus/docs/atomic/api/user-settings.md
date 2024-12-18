---
sidebar_position: 3
title: User Settings
---

## Overview
This module provides functionality to interact with user settings:
- Retrieve current user settings from the backend
- Save complete user settings to the backend
- Update partial user settings in the backend

These operations allow for efficient management and synchronization
of user preferences and configurations within the application.

### fetchUserSettings\<T\>()
Fetches the user settings from the backend API.

__Returns__ A promise that resolves to the user settings.

#### Example
```js title="example-fetch-user-settings.js"
import { fetchUserSettings } from "@sinequa/atomic";

type UserSettings = {
  bookmarks: Bookmark[],
  recentSearches: RecentSearch[],
  savedSearches: SavedSearch[],
  assistants: Record<string, unknown>
};

const settings = await fetchUserSettings<UserSettings>();
console.log("settings", settings);
// Output: a UserSettings object
```


### saveUserSettings\<T\>()
Saves user settings to the server.

| Parameter | Type | Description |
| --- | --- | --- |
| usersettings | `T` | The user settings object to be saved. |
| audit | `AuditEvents` | Optional audit event to be recorded with the save action. |

__Returns__ A promise that resolves to the saved user settings object.

#### Example
```js title="example-save-user-settings.js"
import { saveUserSettings } from "@sinequa/atomic";

saveUserSettings(usersettings).then(_ => console.log("save succeeded!"))
```

### patchUserSettings\<T\>()
Patches (partially updates) user settings on the server.

| Parameter | Type | Description |
| --- | --- | --- |
| usersettings | `Partial<T>` | The partial user settings object containing the properties to be updated. |
| audit | `AuditEvents` | Optional audit event to be recorded with the save action. |

__Returns__ A promise that resolves to the updated user settings object.

#### Example
```js title="example-patch-user-settings.js"
import { patchUserSettings } from "@sinequa/atomic";

// imagine your stored userSettings are: 
// { flag: false, bookmarks: [{id:1, url: "https://mybookmarks.com/bookmark?id=1" }] }

// update the flag state
const settings = await patchUserSettings({ flag: true });
console.log("settings", settings);
// Output: { flag: true, bookmarks: [{id:1, url: "https://mybookmarks.com/bookmark?id=1" }] }
```

### deleteUserSettings()
Deletes all user settings by saving an empty object.
:::warning
This effectively resets the user settings to their default state.
:::

__Returns__ A promise that resolves when the user settings have been successfully deleted.

#### Example
```js title="example-delete-user-settings.js"
import { deleteUserSettings } from "@sinequa/atomic";

// Delete all user settings
deleteUserSettings().then(() => {
  console.log("User settings have been deleted successfully.");
}).catch((error) => {
  console.error("Failed to delete user settings:", error);
});
```


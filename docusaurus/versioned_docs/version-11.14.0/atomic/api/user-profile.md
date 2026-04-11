---
title: User Profile
sidebar_class_name: new
---

The User Profile module (v2 API) provides functions to manage user profiles stored on the backend. It supports full CRUD operations on profile data and individual properties.

## Types

### `UserProfile`

```typescript
type UserProfile = {
  data: UserProfileData;
  customData?: Record<string, unknown>;
  created?: string;
  modified?: string;
};
```

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `data` | `UserProfileData` | ✓ | Main static profile fields |
| `customData` | `Record<string, unknown>` | | Arbitrary custom data |
| `created` | `string` | | Profile creation date |
| `modified` | `string` | | Profile last modification date |

### `UserProfileData`

```typescript
type UserProfileData = {
  id: string;
  mail: string;
  fullName: string;
  jobTitle?: string;
  group?: string;
  organisation?: string;
  location?: string;
  profilePhoto?: string;
  skills?: string;
};
```

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `id` | `string` | ✓ | User identifier |
| `mail` | `string` | ✓ | E-mail address |
| `fullName` | `string` | ✓ | Full name |
| `jobTitle` | `string` | | Job title (e.g. Product Owner) |
| `group` | `string` | | Company group (e.g. R&D) |
| `organisation` | `string` | | Organisation name |
| `location` | `string` | | Location |
| `profilePhoto` | `string` | | Profile photo URL |
| `skills` | `string` | | List of skills |

## Functions

### `fetchUserProfile()`

Fetches the profile for a given user ID.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userId` | `string` | ✓ | Unique identifier of the user |

**Returns** `Promise<UserProfile>` — the user's profile.

**Example**

```typescript title="fetch-user-profile.ts"
import { fetchUserProfile } from '@sinequa/atomic';

const profile = await fetchUserProfile('user123');
console.log(profile.data.fullName);
```

---

### `createUserProfile()`

Creates a new user profile.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userProfile` | `Partial<UserProfile>` | ✓ | Profile data to create. Must include `data.id`. |

**Returns** `Promise<UserProfile>` — the created profile as returned by the API.

**Example**

```typescript title="create-user-profile.ts"
import { createUserProfile } from '@sinequa/atomic';

const newProfile = await createUserProfile({
  data: { id: 'user123', mail: 'john@example.com', fullName: 'John Doe' }
});
console.log(newProfile);
```

---

### `patchUserProfile()`

Updates a specific property within a user profile category.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userProfile` | `Partial<Omit<UserProfile, 'created' \| 'modified'>>` | ✓ | Profile data to update. Must include `data.id`. |
| `category` | `string` | ✓ | The category of the property to update (e.g. `'data'`, `'customData'`) |
| `propertyName` | `string` | ✓ | The name of the specific property to update within the category |

**Returns** `Promise<UserProfile>` — the updated profile.

**Example**

```typescript title="patch-user-profile.ts"
import { patchUserProfile } from '@sinequa/atomic';

const updated = await patchUserProfile(
  { data: { id: 'user123', mail: 'john@example.com', fullName: 'Jane Doe' } },
  'data',
  'fullName'
);
console.log(updated.data.fullName); // 'Jane Doe'
```

---

### `deleteUserProfileProperty()`

Deletes a specific property from a user profile category.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userProfile` | `Partial<Omit<UserProfile, 'created' \| 'modified'>>` | ✓ | Profile data. Must include `data.id`. |
| `category` | `string` | ✓ | The category of the property to delete |
| `propertyName` | `string` | ✓ | The name of the property to delete within the category |

**Returns** `Promise<boolean>` — `true` if the property was deleted, `false` otherwise.

**Example**

```typescript title="delete-user-profile-property.ts"
import { deleteUserProfileProperty } from '@sinequa/atomic';

const deleted = await deleteUserProfileProperty(
  { data: { id: 'user123', mail: 'john@example.com', fullName: 'John Doe' } },
  'customData',
  'preferredTheme'
);
console.log(deleted); // true
```

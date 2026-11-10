---
title: UserProfileService
sidebar_class_name: new
---

The `UserProfileService` fetches a user's profile from the backend API using Angular's `httpResource`. It returns a reactive resource that automatically re-fetches when the user ID changes.

## Methods

### `getUserProfile()`

Returns an `httpResource` that loads the user profile for the given reactive user ID.

```typescript
getUserProfile(userId: Signal<string | undefined>): HttpResourceRef<UserProfile | undefined>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `userId` | `Signal<string \| undefined>` | ✓ | A signal holding the ID of the user whose profile to load. When the signal emits `undefined`, no request is made. |

**Returns** `HttpResourceRef<UserProfile | undefined>` — a reactive resource containing the loaded profile.

**Example**

```typescript title="example.component.ts"
import { inject, signal } from '@angular/core';
import { UserProfileService } from '@sinequa/atomic-angular';

const userProfileService = inject(UserProfileService);
const userId = signal<string | undefined>('user123');
const profile = userProfileService.getUserProfile(userId);
// profile.value() gives the loaded UserProfile or undefined
```

---
title: User profile & settings
sidebar_class_name: new
---

Once authenticated, you typically load the current user (the **principal**), persist some **per-user settings**, and optionally read a richer **user profile**. This recipe covers the three.

## 1. The current user: `fetchPrincipal()`

[`fetchPrincipal()`](../api/principal.md) returns the authenticated `Principal`:

```ts
type Principal = {
  id: string;
  name: string;
  fullName: string;
  email: string;
  userId: string;
  isAdministrator: boolean;
  passwordExpirationDate?: string | null; // ISO date
  // …
};
```

```js title="who-am-i.js"
import { fetchPrincipal } from '@sinequa/atomic';

const me = await fetchPrincipal();
console.log(me.fullName, me.email, me.isAdministrator);
```

## 2. Per-user settings: read, save, patch, delete

[`fetchUserSettings()`](../api/user-settings.md) and friends store an arbitrary, app-defined object per user. The type is generic — you decide the shape.

```js title="settings.js"
import {
  fetchUserSettings,
  saveUserSettings,
  patchUserSettings,
  deleteUserSettings,
} from '@sinequa/atomic';

// Read (returns whatever shape you previously saved)
const settings = await fetchUserSettings();

// Overwrite the whole object
await saveUserSettings({ theme: 'dark', pageSize: 20, recentSearches: ['tesla'] });

// Merge a partial patch (returns the merged result)
const updated = await patchUserSettings({ pageSize: 50 });

// Wipe the user's settings
await deleteUserSettings();
```

## 3. The user profile (v2)

The v2 API exposes a richer, mutable profile. Properties are organized by **category** and **property name**.

```js title="profile.js"
import {
  fetchUserProfile,
  createUserProfile,
  patchUserProfile,
  deleteUserProfileProperty,
} from '@sinequa/atomic';

// Read the profile for a given user id.
const profile = await fetchUserProfile(userId);

// Create a profile from a partial object.
await createUserProfile({ /* …UserProfile fields… */ });

// Patch a single property within a category.
await patchUserProfile({ /* updated profile slice */ }, 'preferences', 'displayName');

// Delete one property of a category.
await deleteUserProfileProperty({ /* profile */ }, 'preferences', 'displayName');
```

## React: a `useProfile` hook + settings persistence

Load the principal once after authentication, and persist a UI preference (here, page size) through user settings.

```jsx title="use-profile.jsx"
import { useEffect, useState } from 'react';
import { fetchPrincipal, fetchUserSettings, patchUserSettings } from '@sinequa/atomic';

export function useProfile() {
  const [principal, setPrincipal] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [me, prefs] = await Promise.all([
          fetchPrincipal(),
          fetchUserSettings().catch(() => ({})), // settings may not exist yet
        ]);
        if (cancelled) return;
        setPrincipal(me);
        setSettings(prefs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist a single preference, optimistically.
  async function updatePref(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await patchUserSettings({ [key]: value });
  }

  return { principal, settings, loading, updatePref };
}
```

```jsx title="ProfilePage.jsx"
import { useProfile } from './use-profile';

export function ProfilePage() {
  const { principal, settings, loading, updatePref } = useProfile();

  if (loading) return <p>Loading…</p>;
  if (!principal) return <p>Not signed in.</p>;

  return (
    <section>
      <h1>{principal.fullName || principal.name}</h1>
      <p>{principal.email}</p>
      {principal.isAdministrator && <span className="badge">Administrator</span>}

      <label>
        Results per page:
        <select
          value={settings?.pageSize ?? 10}
          onChange={(e) => updatePref('pageSize', Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </section>
  );
}
```

## Changing the password

```js title="change-password.js"
import { fetchChangePassword } from '@sinequa/atomic';

const res = await fetchChangePassword(newPassword, currentPassword);
if (!res.success) console.warn(res.message);
```

:::tip Warn before the password expires
`principal.passwordExpirationDate` is an ISO date. Use the date helpers to show a banner — see [Session & token management › Password expiration](./session-and-tokens.md#password-expiration).
:::

## See also

- [Authentication](./authentication.md) — load the principal as part of the auth bootstrap.
- [Principal API](../api/principal.md) · [User Settings API](../api/user-settings.md) · [User Profile API](../api/user-profile.md)

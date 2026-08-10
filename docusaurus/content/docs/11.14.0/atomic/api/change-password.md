---
title: Change Password
sidebar_class_name: new
---

The Change Password module (v2 API) provides functions to change a user's password and to request a password reset by email.

## Types

### `ChangePasswordResponse`

```typescript
type ChangePasswordResponse = {
  success: boolean;
  message?: string;
};
```

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `success` | `boolean` | ✓ | Whether the password change succeeded |
| `message` | `string` | | Optional message from the server |

### `PasswordResetEmailResponse`

```typescript
type PasswordResetEmailResponse = {
  email?: string;
  passwordResetTokenExpiry?: string;
};
```

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `email` | `string` | | The email address to which the reset link was sent |
| `passwordResetTokenExpiry` | `string` | | Expiry date/time of the reset token |

## Functions

### `fetchChangePassword()`

Changes the current user's password.

:::info
Throws an `UnauthorizedError` (401) if the current password is invalid or the user is not authorized.
:::

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `newPassword` | `string` | ✓ | The new password to set |
| `currentPassword` | `string` | | The current password (required by some backends) |

**Returns** `Promise<ChangePasswordResponse>` — result indicating success or failure.

**Example**

```typescript title="change-password.ts"
import { fetchChangePassword } from '@sinequa/atomic';

const result = await fetchChangePassword('newSecureP@ss', 'oldP@ss');
if (result.success) {
  console.log('Password changed successfully');
}
```

---

### `fetchSendPasswordResetEmail()`

Sends a password reset email for the given user. The reset link redirects to `/login?mode=changepassword`.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `userName` | `string` | ✓ | The username for which the reset email should be sent |

**Returns** `Promise<PasswordResetEmailResponse>` — contains the target email and token expiry.

**Example**

```typescript title="send-reset-email.ts"
import { fetchSendPasswordResetEmail } from '@sinequa/atomic';

const response = await fetchSendPasswordResetEmail('john.doe');
console.log('Reset email sent to:', response.email);
```

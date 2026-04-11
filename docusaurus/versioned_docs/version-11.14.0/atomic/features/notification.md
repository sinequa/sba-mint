---
title: Notification System
sidebar_class_name: update
---

The notification system provides a simple, event-based API for dispatching user notifications (success, info, warning, error) throughout your application. Notifications are dispatched as DOM `CustomEvent`s on `window`, making them easy to intercept and display in any UI framework.

## Types

### `NotificationEvent`

Represents a notification dispatched by the system.

```typescript
type NotificationEvent = {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  options?: NotificationsEventOptions;
};
```

### `NotificationsEventOptions`

Options for customizing notification behavior.

```typescript
type NotificationsEventOptions = {
  duration?: number;
  description?: string;
  closeButton?: boolean;
  action?: NotificationAction;
};
```

| Property | Type | Description |
|----------|------|-------------|
| `duration` | `number` | Auto-dismiss duration in milliseconds |
| `description` | `string` | Additional description text |
| `closeButton` | `boolean` | Whether to show a close button |
| `action` | `NotificationAction` | An optional clickable action |

### `NotificationAction`

An optional action button to attach to a notification.

```typescript
type NotificationAction = {
  label: string;
  onClick: () => void;
};
```

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Button label |
| `onClick` | `() => void` | Callback invoked when the user clicks the action |

## Functions

The `notify` object provides four methods, one per notification type. Each dispatches a `notification` `CustomEvent` on `window`.

| Method | Description |
|--------|-------------|
| `notify.success` | Dispatch a success notification |
| `notify.info` | Dispatch an informational notification |
| `notify.warning` | Dispatch a warning notification |
| `notify.error` | Dispatch an error notification |

**Signatures**

```typescript
notify.success(message: string, options?: NotificationsEventOptions): void
notify.info(message: string, options?: NotificationsEventOptions): void
notify.warning(message: string, options?: NotificationsEventOptions): void
notify.error(message: string, options?: NotificationsEventOptions): void
```

**Example**

```typescript title="notifications.ts"
import { notify } from '@sinequa/atomic';

// Simple success
notify.success('Data saved successfully!');

// Info with description and auto-dismiss
notify.info('Sync in progress...', {
  description: 'You can continue working while we sync your data.',
  duration: 4000
});

// Warning with close button
notify.warning('Your session will expire soon.', {
  closeButton: true
});

// Error with action
notify.error('Failed to load data.', {
  description: 'Please check your connection.',
  action: { label: 'Retry', onClick: () => loadData() }
});
```

## Listening for Notifications

Listen for the `notification` event on `window` to render notifications in your UI:

```typescript title="notification-listener.ts"
import type { NotificationEvent } from '@sinequa/atomic';

window.addEventListener('notification', (event: Event) => {
  const { type, message, options } = (event as CustomEvent<NotificationEvent>).detail;

  // Integrate with your preferred toast/snackbar library
  showToast({ type, message, ...options });
});
```

:::note Key features
- Notifications are bubbling `CustomEvent`s named `notification` dispatched on `window`.
- The system is UI-agnostic — you decide how to render notifications.
- All notification types share the same `NotificationsEventOptions` for customization.
:::

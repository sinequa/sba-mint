---
title: Notification System
sidebar_class_name: new
---

The notification system provides a simple, event-based API for dispatching user notifications of various types (success, info, warning, error) throughout your application. Notifications are dispatched as DOM events, making them easy to listen for and display in your UI framework of choice.

## API Reference

### Types

#### `NotificationsEventOptions`

Options for customizing notification behavior.

```typescript
export type NotificationsEventOptions = {
  duration?: number;        // Duration in milliseconds before auto-dismiss (optional)
  description?: string;     // Additional description text (optional)
  closeButton?: boolean;    // Whether to show a close button (optional)
};
```

#### `NotificationEvent`

Represents a notification to be dispatched.

```typescript
export type NotificationEvent = {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;                        // Main notification message
  options?: NotificationsEventOptions;    // Optional customization
};
```

### Helper Functions

The `notify` object provides four methods for dispatching notifications of different types. Each method triggers a `notification` event with the specified type, message, and optional customization options.

| Method            | Description                                 |
|-------------------|---------------------------------------------|
| `notify.success`  | Dispatch a success notification             |
| `notify.info`     | Dispatch an informational notification      |
| `notify.warning`  | Dispatch a warning notification             |
| `notify.error`    | Dispatch an error notification              |

Each method signature:

```typescript
notify.success(message: string, options?: NotificationsEventOptions): void
notify.info(message: string, options?: NotificationsEventOptions): void
notify.warning(message: string, options?: NotificationsEventOptions): void
notify.error(message: string, options?: NotificationsEventOptions): void
```

#### Examples

```typescript
// Success notification
notify.success('Data saved successfully!');

// Info notification with description and duration
notify.info('Sync in progress...', {
  description: 'You can continue working while we sync your data.',
  duration: 4000
});

// Warning notification with close button
notify.warning('Your session will expire soon.', {
  closeButton: true
});

// Error notification with description
notify.error('Failed to load data.', {
  description: 'Please try again later.'
});
```

## Usage

Import the `notify` object from the module to dispatch notifications:

```typescript
import { notify } from '@sinequa/atomic';

// Show a success notification
notify.success('Profile updated successfully!');

// Show an info notification with a description
notify.info('Background sync started.', {
  description: 'You can continue working while data syncs.',
  duration: 5000
});

// Show a warning with a close button
notify.warning('Storage space is low.', {
  closeButton: true
});

// Show an error notification
notify.error('Failed to save changes.', {
  description: 'Please check your network connection and try again.'
});
```

### Example: Customizing Duration and Description

```typescript
notify.success('Upload complete!', {
  duration: 3000, // Auto-dismiss after 3 seconds
  description: 'Your files are now available.'
});
```

### Example: Listening for Notifications

You can listen for notification events anywhere in your application (e.g., in a root component) to display them using your preferred UI library:

```typescript
window.addEventListener('notification', (event: Event) => {
  const detail = (event as CustomEvent).detail;
  // detail: NotificationEvent
  // Display notification in your UI
  showToast(detail.type, detail.message, detail.options);
});
```

### Example: Integrating with a UI Library

Suppose you use a toast/snackbar library (e.g., Material UI, Bootstrap, or a custom solution):

```typescript
window.addEventListener('notification', (event: Event) => {
  const { type, message, options } = (event as CustomEvent).detail;
  // Map notification type to your UI library's variant
  showSnackbar({
    message,
    variant: type, // e.g., 'success', 'info', etc.
    autoHideDuration: options?.duration,
    action: options?.closeButton ? renderCloseButton() : undefined,
    description: options?.description
  });
});
```

## Notes

This system enables a decoupled, flexible approach to user notifications, suitable for any frontend framework or vanilla JS.
:::note Key Features of the Notification System

- Notifications are dispatched as bubbling `CustomEvent`s named `notification` on the `window` object. You can listen for them globally or on specific DOM elements.
- The notification system is UI-agnostic: you decide how to render notifications in your application.
- All notification types support the same options for customization.

:::

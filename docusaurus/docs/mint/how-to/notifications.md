---
title: Notifications in Mint
sidebar_label: Notifications
sidebar_class_name: new
---

Mint uses a custom notification system that leverages the browser's native event system and the [ngx-sonner](https://github.com/emilkowalski/sonner) library to display toast notifications. This system allows any part of the application (including external scripts) to trigger notifications in a decoupled and flexible way.

:::tip
More information about the notification system can be found in the [Atomic documentation](/atomic/features/notification).
:::

## How It Works

- The root `AppComponent` listens for custom `notification` events on the `window` object.
- When a `notification` event is dispatched, the event handler extracts the notification details and displays a toast using `ngx-sonner`.
- The notification can be of type `success`, `warning`, `info`, or `error`.
- Additional options (such as duration, actions, etc.) can be passed to customize the toast.

### Event Structure

The custom event should have the following structure in its `detail` property:

```typescript
{
  type: 'success' | 'warning' | 'info' | 'error',
  title?: string, // Optional title
  message: string, // Main message to display
  options?: ExternalToast // Optional ngx-sonner toast options, but can be extended with custom properties
}
```

:::note

- The notification system is available globally as long as the `AppComponent` is active.
- You can use this system to trigger notifications from Angular services, components, or even from non-Angular scripts.
- For advanced toast options, refer to the [ngx-sonner documentation](https://github.com/emilkowalski/sonner#api).

:::

## Usage Examples

### 1. Triggering a Notification from Anywhere

You can dispatch a notification event from anywhere in your application (including outside Angular) as follows:

```typescript
window.dispatchEvent(new CustomEvent('notification', {
  detail: {
    type: 'success',
    message: 'Your changes have been saved!',
    options: {
      duration: 3000 // Toast will disappear after 3 seconds
    }
  }
}));
```

or using the `notify` object from `@sinequa/atomic`:

```typescript
import { notify } from '@sinequa/atomic';

notify.success('Your changes have been saved!', {
  duration: 3000
});
```

### 2. Triggering an Error Notification

```typescript
window.dispatchEvent(new CustomEvent('notification', {
  detail: {
    type: 'error',
    message: 'Failed to save changes. Please try again.',
    options: {
      duration: 5000
    }
  }
}));
```

or using the `notify` object from `@sinequa/atomic`:

```typescript
import { notify } from '@sinequa/atomic';

notify.error('Failed to save changes. Please try again.', {
  duration: 5000
});
```

### 3. With a Title and Custom Options

```typescript
window.dispatchEvent(new CustomEvent('notification', {
  detail: {
    type: 'info',
    title: 'Information',
    message: 'This is an informational message.',
    options: {
      action: {
        label: 'Undo',
        onClick: () => { /* handle undo */ }
      }
    }
  }
}));
```

or using the `notify` object from `@sinequa/atomic`:

```typescript
import { notify } from '@sinequa/atomic';

notify.info('This is an informational message.', {
  title: 'Information',
  action: {
    label: 'Undo',
    onClick: () => { /* handle undo */ }
  }
});
```

### 4. Using the `notify` Object in Angular

You can use the `notify` object from `@sinequa/atomic` directly in your Angular components or services to trigger notifications.

#### In a Component

```typescript
import { Component } from '@angular/core';
import { notify } from '@sinequa/atomic';

@Component({
  selector: 'app-example',
  template: `<button (click)="showNotification()">Show Notification</button>`
})
export class ExampleComponent {
  showNotification() {
    notify.success('This is a success message!', {
      duration: 3000
    });
  }
}
```

#### In a Service

```typescript
import { Injectable } from '@angular/core';
import { notify } from '@sinequa/atomic';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifySuccess(message: string) {
    notify.success(message, { duration: 3000 });
  }

  notifyError(message: string) {
    notify.error(message, { duration: 5000 });
  }
}
```

You can then inject and use this service anywhere in your Angular app:

```typescript
import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-example',
  template: `<button (click)="showError()">Show Error</button>`
})
export class ExampleComponent {
  notificationService = inject(NotificationService);

  showError() {
    this.notificationService.notifyError('Something went wrong!');
  }
}
```

## Listening to Notifications

Mint's notification system is based on the browser's event system. The main application component (`AppComponent`) listens for custom `notification` events on the `window` object. You can also listen to these events in your own code if you want to react to notifications globally or for custom logic (e.g., analytics, logging, or triggering side effects).

### Example: Listening for Notifications

You can add an event listener for `notification` events anywhere in your application:

```typescript
addEventListener('notification', (event: Event) => {
  const customEvent = event as CustomEvent<{
    type: 'success' | 'warning' | 'info' | 'error';
    title?: string;
    message: string;
    options?: any;
  }>;
  const { type, title, message, options } = customEvent.detail;
  // Handle the notification (e.g., log, analytics, custom UI)
  console.log(`[${type}] ${title ? title + ': ' : ''}${message}`, options);
});
```

If you need to remove the listener (for example, using Angular's new `DestroyRef` API with `onDestroy()`):

```typescript
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-notification-listener',
  template: `<p>Listening for notifications...</p>`
})
export class NotificationListenerComponent {
  private destroyRef = inject(DestroyRef);
  private abortController = new AbortController();

  constructor() {
    window.addEventListener(
      'notification',
      this.handleNotification,
      { signal: this.abortController.signal }
    );

    this.destroyRef.onDestroy(() => {
      this.abortController.abort();
    });
  }

  private handleNotification(event: Event) {
    const customEvent = event as CustomEvent<{
      type: 'success' | 'warning' | 'info' | 'error';
      title?: string;
      message: string;
      options?: any;
    }>;
    const { type, title, message, options } = customEvent.detail;
    console.log(`[${type}] ${title ? title + ': ' : ''}${message}`, options);
  }
}
```

This ensures the event listener is properly cleaned up when the component or service is destroyed.

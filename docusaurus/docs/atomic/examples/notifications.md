---
title: Notifications
sidebar_class_name: new
---

The [notification system](../features/notification.md) is a thin, framework-agnostic layer: calling `notify.success(...)` (or `info` / `warning` / `error`) dispatches a `notification` `CustomEvent` on `window`. **Your UI** listens for those events and renders them however it likes. This recipe wires that into a React toast host.

## Dispatching notifications

```js title="dispatch.js"
import { notify } from '@sinequa/atomic';

notify.success('Document saved.');
notify.error('Search failed.', { description: 'The server returned a 500.' });
notify.info('Indexing in progress…', { duration: 5000 });
notify.warning('Your password expires soon.', {
  action: { label: 'Change now', onClick: () => location.assign('/account/password') },
});
```

Each call dispatches a `notification` event whose `detail` is a `NotificationEvent`:

```ts
type NotificationEvent = {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  options?: {
    duration?: number;       // auto-dismiss after N ms
    description?: string;
    closeButton?: boolean;
    action?: { label: string; onClick: () => void };
  };
};
```

## Vanilla JS: a minimal listener

```js title="listen.js"
window.addEventListener('notification', (event) => {
  const { type, message, options } = event.detail;
  console.log(`[${type}] ${message}`, options?.description ?? '');
  // render your toast here…
});
```

## React: a `<Toaster />` host

A single host component listens for the events, keeps a list of active toasts, and auto-dismisses them. Mount it once near the root of your app.

```jsx title="Toaster.jsx"
import { useEffect, useRef, useState } from 'react';

export function Toaster() {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  useEffect(() => {
    function onNotify(event) {
      const { type, message, options } = event.detail;
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, type, message, options }]);

      const duration = options?.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    }

    window.addEventListener('notification', onNotify);
    return () => window.removeEventListener('notification', onNotify);
  }, []);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
          <div className="toast-body">
            <strong>{t.message}</strong>
            {t.options?.description && <p>{t.options.description}</p>}
            {t.options?.action && (
              <button onClick={() => { t.options.action.onClick(); dismiss(t.id); }}>
                {t.options.action.label}
              </button>
            )}
          </div>
          {(t.options?.closeButton ?? true) && (
            <button className="toast-close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

```jsx title="App.jsx"
import { Toaster } from './Toaster';

export function App() {
  return (
    <>
      {/* your app */}
      <Toaster />
    </>
  );
}
```

Now any module — including internal library code paths that call `notify.*` — surfaces a toast without importing your UI.

:::tip Decouple producers from the UI
Because notifications travel over a DOM event, the code that *raises* a notification never needs a reference to your toast component. Swap the `<Toaster />` for any design-system snackbar without touching call sites.
:::

## See also

- [Notification System](../features/notification.md) — full API reference for `notify`.

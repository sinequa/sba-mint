---
title: isNotInputEvent
---

Returns `true` if the keyboard event did not originate from an `<input>` or `<textarea>` element. Useful for implementing global keyboard shortcuts that should not fire when the user is typing in a form field.

```typescript
function isNotInputEvent(event: KeyboardEvent): boolean
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `event` | `KeyboardEvent` | ✓ | The keyboard event to inspect |

**Returns** `boolean` — `true` if the event target is NOT an `<input>` or `<textarea>`.

**Example**

```typescript title="global-shortcut.ts"
import { isNotInputEvent } from '@sinequa/atomic';

document.addEventListener('keydown', (event) => {
  if (isNotInputEvent(event)) {
    // Safe to handle as a global shortcut
    if (event.key === '/') {
      openSearchBar();
    }
  }
});
```

---
title: isNotInputEvent Utility
---

## Introduction

This utility provides a function to determine if a keyboard event did not originate from an input or textarea element. This is useful for handling global keyboard shortcuts or events that should not trigger when the user is typing in a form field.

## Function

### isNotInputEvent

Returns `true` if the event target is not an `<input>` or `<textarea>` element.

```typescript
function isNotInputEvent(event: KeyboardEvent): boolean
```

#### Parameters

| Parameter | Type           | Description                                 |
|-----------|----------------|---------------------------------------------|
| `event`   | `KeyboardEvent`| The keyboard event to check                 |

#### Returns

| Type      | Description                                 |
|-----------|---------------------------------------------|
| `boolean` | `true` if the event target is not an input or textarea, otherwise `false` |

#### Example

```typescript
import { isNotInputEvent } from '@sinequa/atomic';

document.addEventListener('keydown', (event) => {
  if (isNotInputEvent(event)) {
    // Handle global shortcut
  }
});
```

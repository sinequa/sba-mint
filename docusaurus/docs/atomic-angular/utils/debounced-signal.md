---
title: Debounced Signal
---
## Overview

The `debouncedSignal` function creates a debounced signal that updates its value after a specified timeout.

### Parameters

| Parameter     | Type          | Default | Description                                                   |
|---------------|---------------|---------|---------------------------------------------------------------|
| `input`       | `Signal<T>`   | N/A     | The input signal whose value will be debounced.               |
| `timeOutMs`   | `number`      | `0`     | The debounce timeout in milliseconds. Defaults to 0.          |

#### Returns

| Type        | Description                                                   |
|-------------|---------------------------------------------------------------|
| `Signal<T>` | A new signal that updates its value after the specified debounce timeout. |

#### Example

```typescript
const input = signal('');
const debounced = debouncedSignal(input, 1000);

constructor() {
  effect(() => {
    console.log(debounced());
    // will log the input value after 1 second of inactivity.
  });
}
...
<input [ngModel]="input()" (ngModelChange)="input.set($event)">
```
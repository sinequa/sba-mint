---
title: debouncedSignal()
sidebar_label: Debounced Signal
description: Create a debounced signal that updates its value after a specified timeout.
sidebar_class_name: update
---

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

## Basic Usages

### Signal

```typescript
import { Component, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debouncedSignal } from 'atomic-angular/utils';

@Component({
  selector: 'app-debounced-example',
  imports: [FormsModule],
  template: `
    <input [ngModel]="input()" (ngModelChange)="input.set($event)" />
    <p>Debounced value: {{ debounced() }}</p>
  `,
})
export class DebouncedExampleComponent {
  input = signal('');
  debounced = debouncedSignal(this.input, 1000);

  constructor() {
    effect(() => {
      console.log(this.debounced());
      // Logs the debounced input value after 1 second of inactivity.
    });
  }
}
```

### Model Signal

```typescript
import { Component, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debouncedSignal } from 'atomic-angular/utils';

@Component({
  selector: 'app-debounced-example',
  imports: [FormsModule],
  template: `
    <input [(ngModel)]="input" />
    <p>Debounced value: {{ debounced() }}</p>
  `,
})
export class DebouncedExampleComponent {
  input = model('');
  debounced = debouncedSignal(this.input, 1000);

  constructor() {
    effect(() => {
      console.log(this.debounced());
      // Logs the debounced input value after 1 second of inactivity.
    });
  }
}
```

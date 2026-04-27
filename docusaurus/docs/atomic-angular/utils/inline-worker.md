---
title: InlineWorker
sidebar_class_name: new
---

`InlineWorker` creates a Web Worker inline from a plain function, without requiring a separate worker file. It serializes the function to a Blob URL and runs it in a background thread.

## API

```typescript
new InlineWorker(func: Function)
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `func` | `Function` | ✓ | The function to run inside the worker. |

### `postMessage()`

Sends a message to the worker.

```typescript
postMessage(data: unknown): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `unknown` | ✓ | The data to send to the worker. |

### `onmessage()`

Registers a handler for messages received from the worker.

```typescript
onmessage(handler: (data: MessageEvent) => void): InlineWorker
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `handler` | `(data: MessageEvent) => void` | ✓ | Callback invoked with each message from the worker. |

**Returns** `InlineWorker` — the instance, for chaining.

### `onerror()`

Registers a handler for worker errors.

```typescript
onerror(handler: (data: ErrorEvent) => void): InlineWorker
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `handler` | `(data: ErrorEvent) => void` | ✓ | Callback invoked on worker errors. |

**Returns** `InlineWorker` — the instance, for chaining.

### `terminate()`

Stops the worker.

```typescript
terminate(): void
```

## Example

```typescript title="example.ts"
import { InlineWorker } from '@sinequa/atomic-angular';

const worker = new InlineWorker(() => {
  self.onmessage = (e: MessageEvent) => {
    const result = e.data * 2;
    (self as unknown as Worker).postMessage(result);
  };
});

worker
  .onmessage((e) => console.log('result:', e.data))
  .onerror((e) => console.error(e));

worker.postMessage(21); // logs: result: 42
```

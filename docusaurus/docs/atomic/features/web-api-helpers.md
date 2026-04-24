---
title: Web API Helpers
---

This module provides the foundational utilities for making HTTP requests to the Sinequa API. It includes:

- Structured error classes for typed error handling
- Request configuration and header generation
- HTTP method helpers (GET, POST, PUT, PATCH, DELETE)
- Retry logic and request cancellation via timeout controllers

## Error Classes

### `ApiError`

Base class for all API-related errors. Carries an HTTP `status` code and a `message`.

```typescript
import { ApiError } from '@sinequa/atomic';

try {
  await get('api/v1/query');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`API Error ${error.status}: ${error.message}`);
  }
}
```

### Error Subclasses

| Class | Status Code | Description |
|-------|:-----------:|-------------|
| `UnauthorizedError` | 401 | Authentication failed or token expired |
| `TimeoutError` | 408 | Request exceeded the configured timeout |
| `ServerError` | 500 | The server encountered an internal error |

## Interfaces

### `RequestOptions`

Configuration options for HTTP requests.

```typescript
interface RequestOptions {
  headers?: Headers;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  timeout?: number;
  abortSignal?: AbortSignal;
  maxRetries?: number;
  retryDelay?: number;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `headers` | `Headers` | Custom headers to include in the request |
| `responseType` | `'arraybuffer' \| 'blob' \| 'json' \| 'text'` | Expected response format. Default: `'json'` |
| `timeout` | `number` | Request timeout in milliseconds |
| `abortSignal` | `AbortSignal` | Signal to cancel the request |
| `maxRetries` | `number` | Maximum number of retry attempts on failure |
| `retryDelay` | `number` | Delay between retries in milliseconds |

## HTTP Methods

Each method automatically includes authentication tokens, CSRF token management, and consistent error handling.

### `get()`

```typescript
import { get } from '@sinequa/atomic';

// Simple GET
const data = await get<MyType>('api/v1/principal');

// GET with URL parameters
const params = new URLSearchParams({ action: 'get' });
const result = await get<MyType>('api/v1/principal', params);

// GET with custom options
const blob = await get<Blob>('api/v1/export', params, { responseType: 'blob' });
```

### `post()`

```typescript
import { post } from '@sinequa/atomic';

const results = await post<SearchResults>('api/v1/query', {
  query: { name: '_query', text: 'hello' }
});
```

### `put()`

```typescript
import { put } from '@sinequa/atomic';

const result = await put<UpdateResponse>('api/v1/resource', { id: '123', title: 'Updated' });
```

### `patch()`

```typescript
import { patch } from '@sinequa/atomic';

const result = await patch<UpdateResponse>('api/v1/resource', { id: '123', title: 'Partial' });
```

### `del()`

```typescript
import { del } from '@sinequa/atomic';

const params = new URLSearchParams({ id: '123' });
await del('api/v1/resource', params);
```

## Utility Functions

### `createHeaders()`

Creates the standard headers for Sinequa API requests, including the `Sinequa-Force-Camel-Case` header and the CSRF token if available.

```typescript
import { createHeaders } from '@sinequa/atomic';

const headers = createHeaders();
```

### `createTimeoutController()`

Creates an `AbortController` with an automatic timeout.

```typescript
import { createTimeoutController } from '@sinequa/atomic';

const { controller, signal } = createTimeoutController(5000); // 5 second timeout
```

### `withRetry()`

Executes a fetch function with configurable retry logic.

```typescript
import { withRetry } from '@sinequa/atomic';

const result = await withRetry(
  () => fetch(url, options),
  3,    // max retries
  1000  // retry delay in ms
);
```

## Advanced Usage

### Error Handling

```typescript
import { get, ApiError, UnauthorizedError, ServerError, TimeoutError } from '@sinequa/atomic';

try {
  const data = await get<MyType>('api/v1/query');
} catch (error) {
  if (error instanceof UnauthorizedError) {
    console.log('Session expired. Please log in again.');
  } else if (error instanceof TimeoutError) {
    console.log('Request timed out. Retrying...');
  } else if (error instanceof ServerError) {
    console.log('Server error. Try again later.');
  } else if (error instanceof ApiError) {
    console.log(`API error ${error.status}: ${error.message}`);
  }
}
```

### Request Cancellation with Timeout

```typescript
import { get, createTimeoutController, TimeoutError } from '@sinequa/atomic';

const { signal } = createTimeoutController(10000);

try {
  const data = await get<MyType>('api/v1/query', undefined, { abortSignal: signal });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out after 10 seconds');
  }
}
```

### User Override

```typescript
import { setGlobalConfig } from '@sinequa/atomic';

setGlobalConfig({
  userOverride: { username: 'admin', domain: 'sinequa' },
  userOverrideActive: true
});

// All subsequent API calls will include the override headers
```

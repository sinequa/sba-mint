---
title: Web API Helpers
---

## Introduction

This module provides a comprehensive set of utilities for making HTTP requests to the Sinequa API endpoints. It includes:

- Error handling classes for API communication
- Request creation and response handling functions
- HTTP methods implementations (GET, POST, PUT, DELETE, PATCH)
- Support for authentication token management
- Retry logic for failed requests

## Error Classes

The module defines several error classes for handling different types of API errors:

### `ApiError`

Base class for all API errors.

```typescript
import { ApiError } from '@sinequa/atomic';

try {
  // API operation that might fail
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`API Error: ${error.message}, Status: ${error.status}`);
  }
}
```

### Error Subclasses

| Class | Status Code | Description |
| ----- | ----------- | ----------- |
| `UnauthorizedError` | 401 | Thrown when authentication fails |
| `TimeoutError` | 408 | Thrown when a request times out |
| `ServerError` | 500 | Thrown when the server encounters an internal error |

## Interfaces

### `RequestOptions`

Configuration options for HTTP requests.

```typescript
interface RequestOptions {
  /** Headers personnalisés à inclure dans la requête */
  headers?: Headers;
  /** Type de réponse attendu */
  responseType?: 'arraybuffer'|'blob'|'json'|'text';
  /** Temps maximum d'attente avant expiration de la requête (en ms) */
  timeout?: number;
  /** Signal pour annuler la requête */
  abortSignal?: AbortSignal;
  /** Nombre maximum de tentatives en cas d'échec */
  maxRetries?: number;
  /** Délai entre les tentatives (en ms) */
  retryDelay?: number;
}
```

## Utility Functions

### Request Creation

#### `createHeaders`

Creates headers for web API requests with the necessary Sinequa-specific headers.

```typescript
import { createHeaders } from '@sinequa/atomic';

const headers = createHeaders();
// Headers now include Sinequa-Force-Camel-Case and CSRF token if available
```

#### `createTimeoutController`

Creates an `AbortController` with a timeout.

```typescript
import { createTimeoutController } from '@sinequa/atomic';

const { controller, signal } = createTimeoutController(5000); // 5 second timeout
// Use signal with fetch request
```

### Response Handling

#### `handleResponse`

Processes API responses, handling token refresh and error conditions.

```typescript
import { handleResponse } from '@sinequa/atomic';

const response = await fetch(url, options);
const data = await handleResponse(response);
```

### Request Execution

#### `withRetry`

Executes a fetch function with configurable retry logic.

```typescript
import { withRetry } from '@sinequa/atomic';

const result = await withRetry(
  () => fetch(url, options),
  3,  // max retries
  1000 // retry delay in ms
);
```

## HTTP Methods

The module provides functions for all standard HTTP methods. Each method:

- Automatically includes authentication tokens
- Handles CSRF token management
- Processes error responses consistently
- Supports custom headers and response types
- Includes app name and locale in requests

### GET Requests

```typescript
import { get } from '@sinequa/atomic';
import { API_ENDPOINTS } from '@sinequa/atomic';

// Simple GET request
const data = await get<MyResponseType>(API_ENDPOINTS.QUERY);

// GET with URL parameters
const params = new URLSearchParams();
params.append('id', '123');
const dataWithParams = await get<MyResponseType>(API_ENDPOINTS.DOCUMENT, params);

// GET with custom options
const options = {
  responseType: 'blob',
  headers: new Headers({ 'Custom-Header': 'value' })
};
const blobData = await get<Blob>(API_ENDPOINTS.DOCUMENT_DOWNLOAD, params, options);
```

### POST Requests

```typescript
import { post } from '@sinequa/atomic';

const body = {
  query: 'search terms',
  page: 1
};
const searchResults = await post<SearchResults>(API_ENDPOINTS.QUERY, body);
```

### PUT Requests

```typescript
import { put } from '@sinequa/atomic';

const documentData = {
  id: '123',
  title: 'Updated Document'
};
const result = await put<UpdateResponse>(API_ENDPOINTS.DOCUMENT, documentData);
```

### DELETE Requests

```typescript
import { del } from '@sinequa/atomic';

const params = new URLSearchParams();
params.append('id', '123');
await del(API_ENDPOINTS.DOCUMENT, params);
```

### PATCH Requests

```typescript
import { patch } from '@sinequa/atomic';

const partialUpdate = {
  id: '123',
  title: 'Partially Updated Document'
};
await patch<UpdateResponse>(API_ENDPOINTS.DOCUMENT, partialUpdate);
```

## Advanced Usage

### Error Handling

```typescript
import { get, ApiError, UnauthorizedError, ServerError } from '@sinequa/atomic';

try {
  const data = await get<MyResponseType>(API_ENDPOINTS.QUERY);
  // Process successful response
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Handle authentication issues
    console.log('Authentication failed. Please log in again.');
  } else if (error instanceof ServerError) {
    // Handle server errors
    console.log('Server error occurred. Please try again later.');
  } else if (error instanceof ApiError) {
    // Handle other API errors
    console.log(`API error: ${error.status} - ${error.message}`);
  } else {
    // Handle network or other errors
    console.log('An unexpected error occurred:', error);
  }
}
```

### Custom Response Types

```typescript
import { get } from '@sinequa/atomic';

// Getting a binary file
const pdfData = await get<ArrayBuffer>(
  API_ENDPOINTS.DOCUMENT_DOWNLOAD,
  params,
  { responseType: 'arraybuffer' }
);

// Getting a text response
const textData = await get<string>(
  API_ENDPOINTS.EXPORT,
  params,
  { responseType: 'text' }
);
```

### Request Cancellation

```typescript
import { get, createTimeoutController } from '@sinequa/atomic';

// Create a timeout controller
const { signal } = createTimeoutController(10000); // 10 second timeout

// Use with a request
const options = {
  headers: new Headers(),
  responseType: 'json',
  abortSignal: signal
};

try {
  const data = await get<MyResponseType>(API_ENDPOINTS.QUERY, params, options);
  // Process response
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out');
  }
}
```

### User Override

The helpers automatically handle user override when configured in the global configuration:

```typescript
import { globalConfig } from '@sinequa/atomic';

// Set user override
globalConfig.userOverride = {
  username: 'admin',
  domain: 'sinequa'
};
globalConfig.userOverrideActive = true;

// All subsequent API calls will include the override headers
```

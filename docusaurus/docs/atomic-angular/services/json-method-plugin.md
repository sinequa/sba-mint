---
title: Json Method Plugin Service
---

## Overview
The `JsonMethodPluginService` provides methods to call JSON plugins using HTTP GET and POST requests.

### post()

Call a JsonMethod plugin using an HTTP POST.

```typescript
post<U>(
  method: string,
  query: U,
  options?: Options
): Observable<any>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `method`                 | `string`         | The name of the JsonMethod plugin.                                                       |
| `query`         | `U` | Parameters to pass to the plugin. |
| `options`| `Options`         | HTTP options for the request.                   |

**Usage Example:**

```typescript
const service = new JsonMethodPluginService();
service.post('exampleMethod', { param1: 'value1' }).subscribe(response => {
  console.log(response);
});
```

### get()

Call a JsonMethod plugin using an HTTP POST.

```typescript
get<U extends Record<string, string | boolean | number | Date | object | undefined>>(
  method: string,
  query: U,
  options?: Options
): Observable<any>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `method`                 | `string`         | The name of the JsonMethod plugin.                                                       |
| `query`         | `U` | Parameters to pass to the plugin. |
| `options`| `Options`         | HTTP options for the request.                   |

**Usage Example:**

```typescript
const service = new JsonMethodPluginService();
service.get('exampleMethod', { param1: 'value1' }).subscribe(response => {
  console.log(response);
});
```
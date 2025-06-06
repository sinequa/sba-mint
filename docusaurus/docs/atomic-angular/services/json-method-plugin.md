---
title: JSON Method Plugin Service
---

## Overview

The `JsonMethodPluginService` provides methods to call JSON plugins using HTTP GET and POST requests.


### post

```typescript
post<U>(method: string, query: U, options?: Options): Observable<any>
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `method`  | `string` | The name of the JSON plugin method to call. |
| `query`   | `U` | Parameters to pass to the plugin. |
| `options` | `Options` | HTTP options for the request. |

#### Returns
| Type | Description |
|------|-------------|
| `Observable<any>` | An observable of the plugin's return value. |

#### Example
```typescript
const service = new JsonMethodPluginService();
service.post('exampleMethod', { param1: 'value1' }).subscribe(response => {
  console.log(response);
});
```

### get
```typescript
get<U extends Record<string, string | boolean | number | Date | object | undefined>>
  (method: string, query: U, options?: Options): Observable<any>
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `method`  | `string` | The name of the JSON plugin method to call. |
| `query`   | `U` | Parameters to pass to the plugin. |
| `options` | `Options` | HTTP options for the request. |

#### Returns
| Type | Description |
|------|-------------|
| `Observable<any>` | An observable of the plugin's return value. |

#### Example
```typescript
const service = new JsonMethodPluginService();
service.get('exampleMethod', { param1: 'value1' }).subscribe(response => {
  console.log(response);
});
```

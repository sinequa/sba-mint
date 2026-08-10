---
title: Error
---

The `Error` component is an Angular component that displays a stylized error page, allowing the user to reload the page.

### Methods

| Method   | Signature   | Description                                        |
|----------|-------------|----------------------------------------------------|
| `reload` | `(): void`  | Redirects to the base path and reloads the page.   |

## Examples

The `ErrorComponent` is intended to be used in the application's routing configuration as follows:

```ts
{ path: 'error', component: ErrorComponent }
```

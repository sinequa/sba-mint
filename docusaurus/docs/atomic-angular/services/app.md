---
title: App
---

The `AppService` is responsible for retrieving the application configuration from the server. It provides a method to fetch the configuration using an HTTP GET request.

## Functions

### getApp()

Retrieves the application configuration from the server.

#### Returns

- `Observable<CCApp>`: An observable that emits the application configuration.

#### Remarks

This method constructs an HTTP GET request to fetch the application configuration using the `app` parameter from the global configuration. If the request fails, it logs the error to the console and returns an empty observable.

#### Example

```typescript
appService.getApp().subscribe(appConfig => {
  console.log(appConfig);
});
```

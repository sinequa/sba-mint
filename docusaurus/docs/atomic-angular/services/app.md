---
title: App Service
---

## Overview
The `AppService` is responsible for retrieving the application configuration from the server. It provides a method to fetch the configuration using an HTTP GET request.

### getApp()

Retrieves the application configuration from the server.

```typescript
getApp(appName?: string): Observable<CCApp>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `appName`| `string`         | Optional. The name of the application to fetch the configuration for. Defaults with `app` from the global configuration.                   |

**Usage Example:**

```typescript
appService.getApp().subscribe(appConfig => {
  console.log(appConfig);
});
```
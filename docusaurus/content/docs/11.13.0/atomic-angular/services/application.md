---
title: Application
---

The `ApplicationService` is responsible for handling application-related operations in the application. It provides methods to initialize the application and create routes dynamically based on queries and configuration.

## Functions

### initAndCreateRoutes()

Initializes the application and creates routes.

```typescript
async initAndCreateRoutes(withCreateRoutes = true): Promise<void>
```

#### Parameters

| Parameter         | Type      | Description                                                                 |
|-------------------|-----------|-----------------------------------------------------------------------------|
| withCreateRoutes  | `boolean` | Whether to create routes after initialization. Defaults to `true`.          |

This method performs the following actions:

1. Throws an error if no components are registered and withCreateRoutes is true
2. Calls the `init` method to initialize the application.
3. If withCreateRoutes is true and the query has tab search configuration, it calls the `createRoutes` private method to set up the application routes.

#### Example

```typescript
appService.initAndCreateRoutes().then(() => {
  console.log('Application initialized and routes created');
});
```

### init()

Initializes the application.

```typescript
async init(): Promise<void>
```

This method performs the following actions:

- Fetches the application configuration via appStore.initialize()
- Loads the principal (user information) via principalStore.initialize()
- Loads the user settings via userSettingsStore.initialize()
- Handles and logs any errors during initialization

#### Example

```typescript
appService.init().then(() => {
  console.log('Application initialized');
});
```

## Component Registration

Components are registered via the `ROUTE_COMPONENTS` injection token. This token accepts an array of `ComponentMapping` objects with the following structure:

```typescript
export type ComponentMapping = {
  path: string;
  component: Type<unknown>;
  isRoot?: boolean;
};
```

#### Example

```typescript
// In your app.module.ts
@NgModule({
  providers: [
    {
      provide: ROUTE_COMPONENTS,
      useValue: [
        { path: 'home', component: HomeComponent },
        { path: 'search', component: SearchLayoutComponent, isRoot: true }
      ],
      multi: true
    }
  ]
})
export class AppModule { }
```

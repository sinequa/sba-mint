---
title: Application Bootstrap
sidebar_class_name: new
---

## bootstrapApp()

The `bootstrapApp` function is responsible for bootstrapping the application by ensuring the user is authenticated and initializing the application. It provides a robust initialization process with comprehensive error handling.

### Parameters

| Parameter           | Type                  | Description                                                   |
|--------------------|-----------------------|---------------------------------------------------------------|
| `applicationService` | `ApplicationService` | The service responsible for initializing the application and creating routes |
| `options`          | `object`             | Configuration options for the bootstrap process              |
| `options.createRoutes` | `boolean`        | Whether to create routes during initialization (default: `true`) |

### Return Value

| Type            | Description                                                   |
|-----------------|---------------------------------------------------------------|
| `Promise<void>` | A promise that resolves when the application is ready to be initialized, regardless of success or failure |

### Complete Flow Diagram

```mermaid
flowchart TD
    Start([bootstrapApp called]) --> Auth[Call signIn function]
    Auth -->|Success| AuthSuccess[User authenticated]
    Auth -->|Error| AuthError[Log sign-in error]
    
    AuthSuccess --> RouteCheck{createRoutes parameter?}
    
    RouteCheck -->|true| InitWithRoutes[Call applicationService.initAndCreateRoutes]
    RouteCheck -->|false| InitWithoutRoutes[Call applicationService.init]
    
    InitWithRoutes -->|Success| SuccessWithRoutes[Log: Application initialized]
    InitWithRoutes -->|Error| ErrorWithRoutes[Log: Error initializing application]
    
    InitWithoutRoutes -->|Success| SuccessWithoutRoutes[Log: Application initialized without creating routes]
    InitWithoutRoutes -->|Error| ErrorWithoutRoutes[Log: Error initializing application without routes]
    
    AuthError --> Resolve[Promise resolves]
    SuccessWithRoutes --> Resolve
    ErrorWithRoutes --> Resolve
    SuccessWithoutRoutes --> Resolve
    ErrorWithoutRoutes --> Resolve
    
    style Start fill:#e1f5fe
    style Resolve fill:#e8f5e8
    style AuthError fill:#ffebee
    style ErrorWithRoutes fill:#ffebee
    style ErrorWithoutRoutes fill:#ffebee
```

### Bootstrap Flow

```mermaid
flowchart TD
    A[bootstrapApp function called] --> B[Call signIn function]
    B -->|Authentication success| C[Check createRoutes parameter]
    B -->|Authentication error| D[Log error and resolve]
    
    C -->|createRoutes = true| E[Initialize app with routes]
    C -->|createRoutes = false| F[Initialize app without routes]
    
    E --> G[applicationService.initAndCreateRoutes]
    F --> H[applicationService.init]
    
    G -->|Success| I[Log success message]
    G -->|Error| J[Log error message]
    
    H -->|Success| K[Log success message]
    H -->|Error| L[Log error message]
    
    D --> M[Promise resolves]
    I --> M
    J --> M
    K --> M
    L --> M
```

### Error Handling Flow

```mermaid
flowchart TD
    A[Error in signIn] --> B[Log error to console]
    B --> C[Promise still resolves]
    
    D[Error in applicationService.init] --> E[Log error to console]
    E --> F[Promise still resolves]
    
    G[Error in applicationService.initAndCreateRoutes] --> H[Log error to console] 
    H --> I[Promise still resolves]
    
    style A fill:#ffebee
    style D fill:#ffebee
    style G fill:#ffebee
    style C fill:#e8f5e8
    style F fill:#e8f5e8
    style I fill:#e8f5e8
```

### Usage

```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const applicationService = inject(ApplicationService);
      return bootstrapApp(applicationService, { createRoutes: true });
    }),
    ...
  ]
}
```

### Alternative Usage Without Routes

```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const applicationService = inject(ApplicationService);
      return bootstrapApp(applicationService, { createRoutes: false });
    }),
    ...
  ]
}
```

### Implementation Details

The function performs the following steps:

1. **Authentication Check**: Calls the `signIn()` function to ensure the user is authenticated
2. **Conditional Initialization**: Based on the `createRoutes` parameter:
   - If `true`: Calls `applicationService.initAndCreateRoutes()`
   - If `false`: Calls `applicationService.init()`
3. **Comprehensive Logging**: Provides detailed console logs for each step and outcome
4. **Error Resilience**: All errors are caught and logged, but the promise always resolves

### Key Features

- **Fail-Safe Design**: The function never rejects, ensuring the application can start even if some initialization steps fail
- **Flexible Route Creation**: Optional route creation based on configuration
- **Comprehensive Logging**: Detailed console output for debugging and monitoring
- **Sequential Execution**: Ensures authentication happens before application initialization

### Error Scenarios

- **Authentication Failure**: Logs error but continues with application startup
- **Application Initialization Failure**: Logs error but allows the application to continue
- **Route Creation Failure**: Logs error but allows the application to continue

### Dependencies

The function depends on:

- `signIn()` utility function for authentication
- `ApplicationService` for application initialization
- Console logging for error tracking and debugging

### Best Practices

1. **Use in App Initializer**: This function is designed to be used with Angular's `APP_INITIALIZER` token
2. **Monitor Console Logs**: Pay attention to console output for initialization status
3. **Handle Route Creation**: Choose the appropriate `createRoutes` setting based on your application needs
4. **Error Monitoring**: Consider implementing additional error tracking for production environments

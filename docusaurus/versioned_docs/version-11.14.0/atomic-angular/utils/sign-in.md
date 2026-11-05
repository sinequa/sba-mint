---
title: Authentication
---

## signIn()

The `signIn` function checks the authentication status and handles routing based on the global configuration. It supports both credential-based and automatic login flows.

### Parameters

This function uses Angular's dependency injection and doesn't require explicit parameters. It injects:

- `Router` - For navigation
- `NavigationService` - To get the URL after navigation

### Configuration Dependencies

The function relies on the following global configuration properties:

| Property           | Type      | Description                                                   |
|-------------------|-----------|---------------------------------------------------------------|
| `useCredentials`  | `boolean` | Whether to use credential-based authentication               |
| `loginPath`       | `string`  | The path to redirect to for login                           |
| `userOverrideActive` | `boolean` | Whether user override is currently active                 |

### Complete Flow Diagram

```mermaid
flowchart TD
    Start([signIn called]) --> Context{Injection context?}
    Context -->|No| Error[Throw error]
    Context -->|Yes| Inject[Inject Router & NavigationService]
    
    Inject --> Config[Read global config]
    Config --> UserOverride{userOverrideActive?}
    
    UserOverride -->|Yes| End([Function ends - no action])
    UserOverride -->|No| Credentials{useCredentials?}
    
    Credentials -->|Yes| LoginPage[Navigate to login page<br/>with returnUrl parameter]
    Credentials -->|No| AutoLogin[Attempt automatic login]
    
    LoginPage --> End
    
    AutoLogin --> LoginAPI[Call login API]
    LoginAPI --> Response{Response received?}
    
    Response -->|Yes| Success[Log success message<br/>Continue execution]
    Response -->|No| Warning[Log warning<br/>Navigate to /loading]
    Response -->|Error| HandleError[Catch error]
    
    HandleError --> CheckStatus{Error status?}
    CheckStatus -->|401| Unauthorized[Log unauthorized error<br/>Navigate to loginPath]
    CheckStatus -->|Other| Rethrow[Re-throw error]
    
    Success --> End
    Warning --> End
    Unauthorized --> End
    
    style Start fill:#e1f5fe
    style End fill:#e8f5e8
    style Error fill:#ffebee
    style Warning fill:#fff3e0
    style Unauthorized fill:#ffebee
    style Rethrow fill:#ffebee
```

### Authentication Flow

```mermaid
flowchart TD
    A[signIn function called] --> B[Check userOverrideActive]
    B -->|true| C[No action - user override active]
    B -->|false| D[Check useCredentials]
    
    D -->|true| E[Navigate to login page with returnUrl]
    D -->|false| F[Attempt automatic login]
    
    F --> G[Call login API]
    G -->|Success with response| H[Log success and continue]
    G -->|Success but no response| I[Warn and navigate to /loading]
    G -->|Error| J[Handle error]
    
    J --> K[Check error status]
    K -->|401 Unauthorized| L[Log error and navigate to login]
    K -->|Other error| M[Re-throw error]
```

### Error Handling Flow

```mermaid
flowchart TD
    A[Login API Error] --> B[Log error details]
    B --> C{Check error status}
    C -->|status === 401| D[Log unauthorized message]
    D --> E[Navigate to loginPath]
    C -->|Other status| F[Re-throw error for upstream handling]
```

### Usage

```ts title="app.config.ts"
export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => signIn()),
    ...
  ]
}
```

### Implementation Details

The function performs the following steps:

1. **Injection Context Check**: Ensures it's called within an Angular injection context
2. **Service Injection**: Injects required services (Router, NavigationService)
3. **Configuration Check**: Reads global configuration for authentication strategy
4. **Conditional Authentication**:
   - If `userOverrideActive` is true, no authentication is performed
   - If `useCredentials` is true, redirects to login page with return URL
   - Otherwise, attempts automatic login via API
5. **Error Handling**: Handles login failures with appropriate routing

### Error Scenarios

- **401 Unauthorized**: Redirects to login page
- **No Response**: Redirects to loading page with warning
- **Other Errors**: Re-throws for upstream error handling

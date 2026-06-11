---
title: Authentication
sidebar_class_name: update
---

## signIn()

The `signIn` function checks the authentication status and handles routing based on the global configuration. It supports both credential-based, SSO, and automatic login flows.

### Parameters

This function uses Angular's dependency injection and doesn't require explicit parameters. It injects:

- `Router` - For navigation
- `NavigationService` - To get the URL after navigation

### Configuration Dependencies

The function relies on the following global configuration properties:

| Property          | Type      | Description                                              |
|-------------------|-----------|----------------------------------------------------------|
| `useCredentials`  | `boolean` | Whether to use credential-based authentication           |
| `loginPath`       | `string`  | The path to redirect to for login                        |
| `useSSO`          | `boolean` | Whether the browser handles SSO authentication           |

### Complete Flow Diagram

```mermaid
flowchart TD
    Start([signIn called]) --> Context{Injection context?}
    Context -->|No| Error[Throw error]
    Context -->|Yes| Inject[Inject Router & NavigationService]

    Inject --> Clear[Clear session tokens]
    Clear --> Credentials{useCredentials?}

    Credentials -->|Yes| LoginPage[Navigate to login page\nwith returnUrl parameter]
    Credentials -->|No| SSO{useSSO?}

    SSO -->|Yes| Reload[Reload page\nto trigger SSO login]
    SSO -->|No| AutoLogin[Attempt automatic login]

    LoginPage --> End([Function ends])
    Reload --> End

    AutoLogin --> LoginAPI[Call login API]
    LoginAPI --> Response{Response received?}

    Response -->|Yes| Success[Log success message\nContinue execution]
    Response -->|No| Warning[Log warning]
    Response -->|Error| HandleError[Catch error]

    HandleError --> CheckStatus{Error status?}
    CheckStatus -->|401| Unauthorized[Log unauthorized error\nNavigate to loginPath]
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
    A[signIn function called] --> B[Clear session tokens]
    B --> C{useCredentials?}

    C -->|true| D[Navigate to login page with returnUrl]
    C -->|false| E{useSSO?}

    E -->|true| F[Reload page to trigger SSO login]
    E -->|false| G[Attempt automatic login]

    G --> H[Call login API]
    H -->|Success with response| I[Log success and continue]
    H -->|Success but no response| J[Log warning]
    H -->|Error| K[Handle error]

    K --> L{Check error status}
    L -->|401 Unauthorized| M[Log error and navigate to login]
    L -->|Other error| N[Re-throw error]
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
3. **Session Cleanup**: Calls `clearSessionTokens()` to clear any existing session before authenticating
4. **Conditional Authentication**:
   - If `useCredentials` is true, redirects to the login page with a return URL
   - If `useSSO` is true, reloads the page to let the browser trigger SSO authentication
   - Otherwise, attempts automatic login via API
5. **Error Handling**: Handles login failures with appropriate routing

### Error Scenarios

- **401 Unauthorized**: Redirects to login page
- **No Response**: Logs a warning and continues (no redirect)
- **Other Errors**: Re-throws for upstream error handling

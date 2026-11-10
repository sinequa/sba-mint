---
title: Authentication
sidebar_class_name: new
---

This recipe covers the full authentication lifecycle: configuring the library, detecting an existing session, the three login flows (credentials, SSO, bearer token), logout, and wiring it all into a React context with protected routes.

The relevant functions are documented individually under [Authentication](../authentication/login.md). Here we show how they fit together.

:::caution Never call `login()` (no arguments) automatically at startup
If there is no session **and** an SSO provider is configured, `login()` **immediately redirects** to the provider — landing you in a redirect loop on the login page. At startup, call `getCsrfToken()` (which does **not** redirect) to silently detect an existing session. Only call `login()` on an explicit "SSO" click.
:::

## 1. Bootstrap the library

At startup you typically: set the app name, run `initializeAppConfig()` (reads `backendUrl` + SSO providers from the server's pre-login config), then probe for an existing session with `getCsrfToken()`.

```js title="bootstrap.js"
import {
  setGlobalConfig,
  initializeAppConfig,
  getCsrfToken,
  isAuthenticated,
  globalConfig,
} from '@sinequa/atomic';

export async function bootstrap() {
  // 1. Tell the library which Sinequa app to talk to.
  setGlobalConfig({ app: 'my-app' });

  try {
    // 2. Populates backendUrl + auto OAuth/SAML providers from the server.
    await initializeAppConfig();
  } catch {
    // Pre-login may fail (e.g. app name not set); credential login still works.
  }

  // 3. Silently picks up an existing cookie / SSO-redirect session. Does NOT redirect. Returns the
  //    token, or null when there's no ambient session; throws only on a transport failure.
  try {
    await getCsrfToken();
  } catch {
    // Probe failed (transport) — proceed unauthenticated; the user will authenticate explicitly.
  }

  return {
    authenticated: isAuthenticated(),
    providers: {
      oauth: globalConfig.autoOAuthProvider || undefined,
      saml: globalConfig.autoSAMLProvider || undefined,
    },
  };
}
```

:::info `isAuthenticated()` only tests presence
It returns `true` as soon as a CSRF token exists in `sessionStorage` — it does **not** validate it. An expired token still returns `true`. That's fine to drive the UI; a later request with a stale token triggers re-authentication (see [Session & token management](./session-and-tokens.md)).
:::

## 2. The three login flows

```js title="login-flows.js"
import {
  login,
  getJWToken,
  emitAuthenticatedEvent,
  setGlobalConfig,
} from '@sinequa/atomic';

// a) Credentials → JWT login. login() emits the 'authenticated' event itself.
export function loginWithCredentials(username, password) {
  return login({ username, password });
}

// b) SSO → no credentials. The library attempts SSO, then redirects to OAuth/SAML
//    if configured. You can force a specific provider BEFORE calling login().
export function loginWithSSO(provider, kind = 'oauth') {
  if (provider) {
    setGlobalConfig(
      kind === 'saml'
        ? { autoSAMLProvider: provider, useSAML: true }
        : { autoOAuthProvider: provider },
    );
  }
  return login(); // redirects
}

// c) Bearer token → this path does NOT go through login(), so emit the event manually.
export async function loginWithBearer(token) {
  setGlobalConfig({ bearerToken: token });
  await getJWToken();          // stores the CSRF token, throws on failure
  emitAuthenticatedEvent(true);
  return true;
}
```

## 3. The `'authenticated'` event is the source of truth

Whichever flow runs, completion is signalled by an `'authenticated'` DOM event carrying `{ detail: { authenticated: boolean } }`. `emitAuthenticatedEvent` uses the global `dispatchEvent` (i.e. `window`); listen on `window` (and `document` to be safe).

```js title="listen-auth.js"
function onAuthenticated(event) {
  const { authenticated } = event.detail;
  console.log('Auth state changed:', authenticated);
}

window.addEventListener('authenticated', onAuthenticated);
document.addEventListener('authenticated', onAuthenticated);
```

## 4. Logout

`logout()` clears the tokens, removes the server-side cookie, and returns an optional logout URL to redirect to (e.g. to end the SSO session).

```js title="logout.js"
import { logout } from '@sinequa/atomic';

export async function signOut() {
  const redirectUrl = await logout();
  if (redirectUrl) window.location.href = redirectUrl;
}
```

## React: an `AuthProvider` context

The idiomatic React integration encapsulates the bootstrap, the event listener, and the actions in a single context. This mirrors the official tutorial.

```jsx title="auth-context.jsx"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  initializeAppConfig,
  emitAuthenticatedEvent,
  fetchPrincipal,
  getCsrfToken,
  getJWToken,
  globalConfig,
  isAuthenticated,
  login,
  logout,
  setGlobalConfig,
} from '@sinequa/atomic';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initializing, setInitializing] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [providers, setProviders] = useState({});

  // Stable ref so the event listener can refresh the principal without
  // being re-registered on every render.
  const refreshPrincipal = useRef(async (isAuth) => {
    if (!isAuth) return setPrincipal(null);
    try {
      setPrincipal(await fetchPrincipal());
    } catch {
      setPrincipal(null);
    }
  });

  // Client-only bootstrap. None of this runs during SSR.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setGlobalConfig({ app: import.meta.env.VITE_SINEQUA_APP });

      try {
        await initializeAppConfig();
      } catch {
        /* pre-login optional */
      }
      try {
        await getCsrfToken(); // silent session detection, no redirect; null if no session
      } catch {
        /* transport failure — proceed unauthenticated */
      }

      if (cancelled) return;
      setProviders({
        oauth: globalConfig.autoOAuthProvider || undefined,
        saml: globalConfig.autoSAMLProvider || undefined,
      });
      const authed = isAuthenticated();
      setAuthenticated(authed);
      await refreshPrincipal.current(authed);
      setInitializing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 'authenticated' event = single source of truth across all login paths.
  useEffect(() => {
    const onAuthenticated = (event) => {
      const authed = event.detail.authenticated;
      setAuthenticated(authed);
      void refreshPrincipal.current(authed);
    };
    window.addEventListener('authenticated', onAuthenticated);
    document.addEventListener('authenticated', onAuthenticated);
    return () => {
      window.removeEventListener('authenticated', onAuthenticated);
      document.removeEventListener('authenticated', onAuthenticated);
    };
  }, []);

  const loginWithCredentials = useCallback(
    (username, password) => login({ username, password }),
    [],
  );

  const loginWithBearer = useCallback(async (token) => {
    setGlobalConfig({ bearerToken: token });
    await getJWToken();
    emitAuthenticatedEvent(true);
    return true;
  }, []);

  const loginWithSSO = useCallback((provider, kind = 'oauth') => {
    if (provider) {
      setGlobalConfig(
        kind === 'saml'
          ? { autoSAMLProvider: provider, useSAML: true }
          : { autoOAuthProvider: provider },
      );
    }
    return login();
  }, []);

  const signOut = useCallback(async () => {
    const redirectUrl = await logout();
    if (redirectUrl) window.location.href = redirectUrl;
  }, []);

  const value = useMemo(
    () => ({
      initializing,
      authenticated,
      principal,
      providers,
      loginWithCredentials,
      loginWithBearer,
      loginWithSSO,
      signOut,
    }),
    [initializing, authenticated, principal, providers,
     loginWithCredentials, loginWithBearer, loginWithSSO, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
```

### A login form

```jsx title="LoginForm.jsx"
import { useState } from 'react';
import { useAuth } from './auth-context';

export function LoginForm() {
  const { loginWithCredentials, loginWithSSO, providers } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ok = await loginWithCredentials(username, password);
      if (!ok) setError('Invalid credentials.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

      {providers.oauth && (
        <button type="button" onClick={() => loginWithSSO(providers.oauth, 'oauth')}>
          Sign in with SSO
        </button>
      )}

      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

### Protecting routes

Use the context to gate the rest of the app. While `initializing` is `true`, render nothing (or a spinner) to avoid a flash of the login screen.

```jsx title="RequireAuth.jsx"
import { useAuth } from './auth-context';

export function RequireAuth({ children, fallback }) {
  const { initializing, authenticated } = useAuth();

  if (initializing) return <p>Loading…</p>;
  if (!authenticated) return fallback; // e.g. <Navigate to="/login" /> or <LoginForm />
  return children;
}
```

## See also

- [Session & token management](./session-and-tokens.md) — handling expiry and silent re-auth.
- [User profile & settings](./user-profile-and-settings.md) — what to load once authenticated.

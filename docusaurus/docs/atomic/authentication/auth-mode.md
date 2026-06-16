# Authentication mode — `AuthMode` (2.0)

## Why this exists

Before 2.0, the authentication method was encoded with **overlapping booleans** on the mutable
`globalConfig` singleton: `useCredentials`, `useSSO`, `useSAML` (plus the provider/token inputs
`autoOAuthProvider`, `autoSAMLProvider`, `bearerToken`).

The combination `useCredentials === true && useSSO === true` smuggled a **third, implicit meaning**
— *"unknown: try SSO, then fall back to credentials"* — into a two-boolean space. Every consumer
interpreted that ambiguous state differently (`signIn`, `AuthGuard`, the sign-in screen), which led
to bugs such as the login screen spinning and redirecting to `/error` instead of showing the
credentials form. The SSO-resolution branch in `login()` was also **dead code**: SSO was in reality
only ever "detected" by `getCsrfToken()` succeeding.

## The model

`globalConfig.authMode` is now the **single source of truth**, a discriminated union:

```ts
type AuthMode =
  | { kind: "credentials" }              // username/password form
  | { kind: "sso" }                      // browser/proxy injected auth (CSRF token present)
  | { kind: "oauth"; provider: string }  // auto OAuth redirect
  | { kind: "saml"; provider: string }   // auto SAML redirect
  | { kind: "bearer"; token: string }    // server-to-server bearer token
  | { kind: "unknown" };                 // "try SSO, then fall back to credentials"
```

Constructors: `AuthMode.credentials()`, `AuthMode.sso()`, `AuthMode.oauth(p)`, `AuthMode.saml(p)`,
`AuthMode.bearer(t)`, `AuthMode.unknown()`.

### Detection (server authority preserved)

`detectAuthMode(config, preLogin?)` (in `authentication/session/detect-auth-mode.ts`) is a **pure**
function — no I/O, no mutation. `initializeAppConfig()` still calls `fetchAppPreLogin()` and feeds the
server response in. Precedence:

```
credentials preset > bearer token > OAuth provider > SAML provider > unknown
```

For OAuth/SAML the **config provider takes precedence, the server provider is the fallback**
(`config.autoOAuthProvider || preLogin?.autoOAuthProvider`), exactly as before — so when the
environment defines no provider (the common case), the backend remains authoritative. When neither
side declares a provider, the mode is `unknown`. OAuth wins over SAML when both are present (runtime
parity).

### Resolution in `login()`

`login()` acts on the resolved mode. With explicit credentials it authenticates directly; `credentials`
mode shows the form; `bearer` uses the configured token. For `oauth` / `saml` / `sso` / `unknown` it
**checks for an existing session FIRST** — an existing token, or a successful `getCsrfToken()` (which
also covers proxy/browser SSO) ⇒ authenticated — and only runs the mode handshake when there is **no**
session:

- `oauth` / `saml` → redirect to the provider;
- `sso` → not authenticated (the CSRF probe already failed);
- `unknown` → probe for server-side auto-authentication ([`tryAutoAuthentication`](./tryAutoAuthentication.md),
  e.g. OIDC) — a `200` is recorded as `sso` — then, failing that, set `authMode = credentials` so the
  login form is shown (deterministic fallback, no UI-side timeout); a successful CSRF probe is also
  recorded as `sso`.

Checking the session **before** any provider redirect is essential: otherwise a re-bootstrap after a
successful OAuth/SAML sign-in would redirect to the provider again → reload loop (the original dead
`fetchPrincipal` branch never did this; the symptom was caught and fixed — see the post-mortem in
`@sinequa/atomic-angular`).

## Backward compatibility

`useCredentials` / `useSSO` / `useSAML` are kept as **`@deprecated` read-only getters** derived from
`authMode`:

| `authMode.kind` | `useCredentials` | `useSSO` | `useSAML` |
| --- | --- | --- | --- |
| `credentials` | `true` | `false` | `false` |
| `sso` | `false` | `true` | `false` |
| `saml` | `false` | `false` | `true` |
| `unknown` | `true` | `true` | `false` |
| `oauth` / `bearer` | `false` | `false` | `false` |

`setGlobalConfig` also accepts **legacy boolean writes** and translates them into an `authMode`
(`useCredentials && useSSO → unknown`, etc.). An explicit `authMode` in the same call always wins.
Existing reads and writes therefore keep working unchanged; new code should read `authMode.kind`.

> The getters are non-enumerable accessors defined on the instance, so `Object.assign` of other keys
> never clobbers them and `{ ...globalConfig }` does not copy them. Direct assignment
> (`globalConfig.useCredentials = …`) throws — always go through `setGlobalConfig`.

## Migration notes for consumers

- Prefer `globalConfig.authMode.kind` over the deprecated booleans.
- Provider/token inputs (`autoOAuthProvider`, `autoSAMLProvider`, `bearerToken`) and impersonation
  (`userOverride` / `userOverrideActive`) are unchanged.
- `login(credentials?)`, `logout`, `clearSessionTokens`, `isAuthenticated`, `initializeAppConfig`
  (+ deprecated `appInitializerFn` alias) keep their signatures.

## See also

- [**Authentication flows**](./auth-flows.md) — every mode handled end to end, with diagrams: the
  detection decision tree, the session-first check in `login()`, the **OIDC / server-side
  auto-authentication** probe, **token-expiry re-authentication**, the OAuth/SAML **redirect loop
  guard**, impersonation, and how server errors (e.g. a bad app name → HTTP 500) are surfaced.
- [`tryAutoAuthentication`](./tryAutoAuthentication.md) — the `unknown`-mode auto-auth probe (OIDC).

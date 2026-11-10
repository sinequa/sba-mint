# Changelog — feat: typed `AuthMode` (2.0)

> Branch: `next/2.0-authmode`
> Version: `1.1.4` → `2.0.0`

## Overview

Replaces the overlapping authentication-mode booleans (`useCredentials` / `useSSO` / `useSAML`) with
a single typed `AuthMode` discriminated union as the source of truth on `globalConfig`. See
`docs/authentication/auth-mode.md` for the full rationale and model.

---

## Added

- `AuthMode` type + constructors and `AuthModeKind` (`src/configurations/auth-mode.ts`), exported from
  the package root.
- `globalConfig.authMode` — the source of truth for the authentication method.
- `detectAuthMode(config, preLogin?)` — pure resolution of the mode from config + server pre-login
  (`src/authentication/session/detect-auth-mode.ts`), exported from `authentication`.
- New tests: `detect-auth-mode.test.ts`, `configurations/tests/global-config.test.ts`, and the
  `unknown → SSO/credentials` resolution cases in `login.test.ts`.

## Changed

- `login()` rewritten to switch on `authMode`. The `unknown` mode now performs a **real** "try SSO,
  then fall back to credentials" resolution (the previous SSO-resolution block was dead code). On
  fallback it sets `authMode = credentials` so the login form is shown deterministically.
- `initializeAppConfig()` resolves the mode via `detectAuthMode` (server providers still authoritative
  when the config defines none) and stores it in `authMode`. `appInitializerFn` alias preserved.
- `setGlobalConfig()` now translates legacy boolean writes (`useCredentials`/`useSSO`/`useSAML`) into
  an `authMode`; an explicit `authMode` wins.

## Deprecated

- `globalConfig.useCredentials` / `useSSO` / `useSAML` are now **read-only getters derived from
  `authMode`**. Reads keep working; writes go through `setGlobalConfig` (translated). Prefer
  `authMode.kind` in new code.

## Notes

- Provider/token inputs (`autoOAuthProvider`, `autoSAMLProvider`, `bearerToken`) and impersonation
  (`userOverride` / `userOverrideActive`) are unchanged.
- Behavioral parity: OAuth wins over SAML when both providers are present.
- Tests: full atomic suite green (273/273); `tsc --noEmit` clean.

---
title: "Changelog — feat: SPFx support via ./spfx subpath export"
---

# Changelog — feat: SPFx support

> Branch: `feat/spfx-support`
> Version: `2.0.3` → next

## Overview

Adds first-class SharePoint Framework support. In an SPFx web part, all HTTP requests must go
through the `AadHttpClient` so the Azure AD bearer token is attached automatically. A new
`@sinequa/atomic/spfx` subpath export exposes `initializeAadHttpClient`, which registers the SPFx
client as the global HTTP transport. All existing SDK call sites work unchanged — no migration needed.

---

## Added

- `AadHttpClientLike` / `AadHttpResponseLike` — structural interfaces that model the SPFx client and
  its response without taking a hard dependency on `@microsoft/sp-http`
  (`src/web-api/helpers/aad-http-client-manager.ts`).
- `AadHttpClientManager` singleton — consulted by all HTTP helpers; routes through the registered
  client when present, falls back to `fetch` otherwise.
- `initializeAadHttpClient(client | null)` — public function to register or detach an `AadHttpClient`.
- `src/spfx/index.ts` — re-exports everything from `@sinequa/atomic` plus the three SPFx-specific
  exports above.
- `@sinequa/atomic/spfx` subpath entry in `package.json` (`exports` + `typesVersions`) and
  `vite.config.ts` lib entry.
- `@microsoft/sp-http` declared as optional `peerDependencies` (never bundled).
- 13 new tests (`src/web-api/helpers/aad-http-client-manager.test.ts`).

## Changed

- `handleResponse` (`src/web-api/helpers/handle-response.ts`) — accepts `AadHttpResponseLike`
  instead of `Response` so SPFx `HttpClientResponse` objects are handled natively.
- HTTP method helpers `get` / `post` / `put` / `patch` / `del` — check `aadHttpClientManager.isInitialized()`
  and route accordingly.

## Non-breaking

Standard consumers that import from `@sinequa/atomic` are unaffected. No client is ever registered
outside an SPFx host, so the helpers fall back to `fetch` exactly as before.

---

## Migration guide

### SPFx web parts

```typescript
// Before — would use fetch (no AAD token)
import { fetchQuery } from '@sinequa/atomic';

// After — route through AadHttpClient
import { initializeAadHttpClient, fetchQuery } from '@sinequa/atomic/spfx';
import { AadHttpClient } from '@microsoft/sp-http';

protected async onInit(): Promise<void> {
  const client = await this.context.aadHttpClientFactory
    .getClient('https://my-sinequa-server.example.com');
  initializeAadHttpClient(client);
}

protected onDispose(): void {
  initializeAadHttpClient(null);
}
```

### Non-SPFx consumers

No changes required.

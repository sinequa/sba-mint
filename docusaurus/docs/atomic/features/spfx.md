---
title: SharePoint Framework (SPFx)
---

In a SharePoint Framework web part, every outbound HTTP request must go through the `AadHttpClient`
so the Azure AD bearer token is attached automatically. The `@sinequa/atomic/spfx` subpath export
provides a one-call setup that routes all SDK requests through the SPFx client without changing any
call-site code.

:::info[Peer dependency]

`@microsoft/sp-http` is optional and never bundled. Install it only in SPFx projects:

```bash
npm install @microsoft/sp-http --save-peer
```

:::

## Setup

### 1. Import from the `/spfx` subpath

```typescript
import { initializeAadHttpClient, fetchQuery } from '@sinequa/atomic/spfx';
import { AadHttpClient } from '@microsoft/sp-http';
```

The `/spfx` subpath re-exports everything from `@sinequa/atomic` and adds `initializeAadHttpClient`,
`AadHttpClientLike`, and `AadHttpResponseLike`. Standard (non-SPFx) consumers use `@sinequa/atomic`
directly — no changes needed.

### 2. Call `initializeAadHttpClient` in `onInit()`

```typescript
protected async onInit(): Promise<void> {
  const client = await this.context.aadHttpClientFactory
    .getClient('https://my-sinequa-server.example.com');

  initializeAadHttpClient(client);

  // Optional — set the backend URL so relative paths resolve correctly:
  setGlobalConfig({ backendUrl: 'https://my-sinequa-server.example.com' });
}
```

After this call every SDK function (`fetchQuery`, `fetchAggregation`, `fetchApp`, …) routes through
`AadHttpClient` and the Azure AD token is attached on every request.

### 3. Use the SDK normally

```typescript
import { fetchQuery, fetchAggregation } from '@sinequa/atomic/spfx';

const results = await fetchQuery({ name: '_query', text: 'knowledge management' });
const facets  = await fetchAggregation({ aggregation: 'company', query: 'knowledge management' });
```

### 4. Detach in `onDispose()` (recommended)

```typescript
protected onDispose(): void {
  initializeAadHttpClient(null);
}
```

---

## Full web part example

```typescript
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { AadHttpClient } from '@microsoft/sp-http';
import {
  initializeAadHttpClient,
  setGlobalConfig,
  fetchQuery,
} from '@sinequa/atomic/spfx';

export default class SinequaSearchWebPart extends BaseClientSideWebPart<{}> {
  protected async onInit(): Promise<void> {
    const client = await this.context.aadHttpClientFactory
      .getClient('https://my-sinequa-server.example.com');

    initializeAadHttpClient(client);
    setGlobalConfig({
      app: 'my-app',
      backendUrl: 'https://my-sinequa-server.example.com',
    });
  }

  public async render(): Promise<void> {
    const results = await fetchQuery({ name: '_query', text: 'hello world' });
    this.domElement.innerHTML = `<p>${results.cursorRowCount} results</p>`;
  }

  protected onDispose(): void {
    initializeAadHttpClient(null);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
```

---

## How it works

The `aadHttpClientManager` singleton (`src/web-api/helpers/aad-http-client-manager.ts`) is consulted
by every HTTP helper (`get`, `post`, `put`, `patch`, `del`). When a client is registered:

- Requests are routed through `AadHttpClient.get()` / `.post()` / `.fetch()`.
- The Azure AD bearer token is attached by the SPFx runtime — no manual header management.
- `handleResponse` accepts the SPFx `HttpClientResponse` shape via the `AadHttpResponseLike`
  interface, so error handling and response parsing are identical.

When no client is registered (the default in non-SPFx builds), all helpers fall back to `fetch` —
no behavior change for existing consumers.

---

## API reference

### `initializeAadHttpClient(client)`

Registers an `AadHttpClient` (or any object satisfying `AadHttpClientLike`) as the active HTTP
transport. Pass `null` to detach it.

| Parameter | Type | Description |
|-----------|------|-------------|
| `client` | `AadHttpClientLike \| null` | The SPFx client to register, or `null` to detach. |

### `AadHttpClientLike`

Structural interface satisfied by a real `@microsoft/sp-http` `AadHttpClient`. Use it to type mock
clients in tests:

```typescript
import type { AadHttpClientLike, AadHttpResponseLike } from '@sinequa/atomic/spfx';

const mockClient: AadHttpClientLike = {
  get:   (url) => Promise.resolve(mockResponse),
  post:  (url, cfg, opts) => Promise.resolve(mockResponse),
  fetch: (url, cfg, opts) => Promise.resolve(mockResponse),
};
```

### `AadHttpResponseLike`

Minimal structural response shape compatible with both the DOM `Response` and the SPFx
`HttpClientResponse`. Exposes: `status`, `headers.get()`, `url?`, `arrayBuffer()`, `blob()`,
`text()`, `json()`, `body?`, `clone?()`.

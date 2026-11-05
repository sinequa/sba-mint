---
title: Intercepting Audit API Calls
sidebar_label: Audit Interceptor
sidebar_class_name: new
---

Mint sends audit events to the Sinequa backend via `api/v1/audit`. You can intercept these calls to add custom logic — such as logging, analytics, enrichment, or custom error handling — without modifying the library internals.

The interception is done by overriding the browser's native `window.fetch` function **before** the Angular application starts. This works independently of Angular and requires no knowledge of Angular-specific concepts.

---

## How it works

The browser exposes a global `fetch` function that every HTTP call goes through. The approach is:

1. **Save** a reference to the original `fetch` before touching it.
2. **Replace** `window.fetch` with your own function.
3. Inside your function, **filter** calls by URL — only intercept audit ones.
4. For non-audit calls, **pass through** immediately to the original `fetch`.
5. For audit calls, add your custom logic, then call the original `fetch` normally.

This ensures no existing behaviour is broken.

---

## Step-by-step guide

### Step 1 — Save the original `fetch`

Add this line **before** any other code in `app.config.ts` (outside the `appConfig` object):

```typescript title="src/app2/app.config.ts"
// Keep a reference to the original fetch before overriding it
const { fetch: originalFetch } = window;
```

:::warning
This line **must** come before `window.fetch = ...`. If you save the reference after you've already overridden it, you'll create an infinite loop.
:::

---

### Step 2 — Override `window.fetch`

Right after the line above, add:

```typescript title="src/app2/app.config.ts"
window.fetch = async (...args) => {
  const [resource, config] = args;

  // Extract the URL from the request (handles both string and Request object)
  const url = resource instanceof Request ? resource.url : String(resource);

  // If this is NOT an audit call, let it go through untouched
  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  // ✅ This is an audit call — add your logic here
  const response = await originalFetch(resource, config);
  return response;
};
```

At this point you have a working interceptor that does nothing extra. The following steps show how to add useful logic inside the `if` block.

---

### Step 3 — Intercept the request (before it is sent)

You can inspect or log the outgoing request **before** calling `originalFetch`. The body of a `fetch` request is in `config.body`:

```typescript title="src/app2/app.config.ts"
window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = resource instanceof Request ? resource.url : String(resource);

  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  // highlight-start
  // Inspect the request body before sending
  if (config?.body) {
    try {
      const requestBody = JSON.parse(config.body as string);
      console.log("[Audit] Outgoing request:", requestBody);
    } catch {
      // body is not JSON — ignore
    }
  }
  // highlight-end

  const response = await originalFetch(resource, config);
  return response;
};
```

---

### Step 4 — Intercept the response (after the server replies)

The `response` object from `fetch` can only be **read once**. If you want to inspect the body, you **must clone it** first — otherwise the caller will receive an already-consumed response and your app will break.

```typescript title="src/app2/app.config.ts"
window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = resource instanceof Request ? resource.url : String(resource);

  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  const response = await originalFetch(resource, config);

  // highlight-start
  // Clone BEFORE reading — the original response is returned to the caller untouched
  const responseClone = response.clone();
  const responseBody = await responseClone.json();
  console.log("[Audit] Server response:", responseBody);
  // highlight-end

  return response; // Always return the original, not the clone
};
```

:::warning Always return the original response
Return `response`, not `responseClone`. The clone is only for reading. If you return the clone, the body has already been consumed and the app will fail.
:::

---

### Step 5 — Handle errors

Wrap the whole block in a `try/catch` to handle network failures gracefully:

```typescript title="src/app2/app.config.ts"
window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = resource instanceof Request ? resource.url : String(resource);

  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  try {
    const response = await originalFetch(resource, config);

    if (!response.ok) {
      console.error(`[Audit] Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("[Audit] Network error:", error);
    throw error; // Re-throw so Angular's own error handling still fires
  }
};
```

:::caution Always re-throw errors
If you catch an error and don't re-throw it, Angular will think the request succeeded. Always `throw error` after logging.
:::

---

## Complete example

Here is the full interceptor combining all the steps above, ready to paste at the top of `app.config.ts`:

```typescript title="src/app2/app.config.ts"
// Keep a reference to the original fetch before overriding it
const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = resource instanceof Request ? resource.url : String(resource);

  // Let all non-audit calls pass through untouched
  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  // --- Inspect the outgoing request ---
  if (config?.body) {
    try {
      const requestBody = JSON.parse(config.body as string);
      console.log("[Audit] Outgoing request:", requestBody);
    } catch {
      // body is not JSON
    }
  }

  try {
    const response = await originalFetch(resource, config);

    if (!response.ok) {
      console.error(`[Audit] Request failed with status ${response.status}`);
      return response;
    }

    // --- Inspect the response body ---
    const responseClone = response.clone();
    const responseBody = await responseClone.json();
    console.log("[Audit] Server response:", responseBody);

    return response; // Always return the original response
  } catch (error) {
    console.error("[Audit] Network error:", error);
    throw error;
  }
};

export const appConfig: ApplicationConfig = {
  // ... rest of your config
};
```

---

## Where to place this code in the file

Your `app.config.ts` file should look like this (only the relevant structure is shown):

```typescript title="src/app2/app.config.ts"
// 1. Imports
import { ... } from '...';

// 2. ✅ Your fetch interceptor goes here — BEFORE appConfig
const { fetch: originalFetch } = window;
window.fetch = async (...args) => { ... };

// 3. The appConfig declaration
export const appConfig: ApplicationConfig = {
  providers: [ ... ]
};
```

---

## Real-world example

The following example is based on a real audit payload sent when a user closes a document preview:

```json
{
  "app": "mint_rnd",
  "event": "None",
  "$auditRecord": {
    "auditEvents": [
      {
        "type": "Preview_Close",
        "detail": {
          "docid": "/NS_Web/Wikipedia/|https://en.wikipedia.org/wiki/Bill_Gates",
          "rank": 0,
          "collection": "/NS_Web/Wikipedia/",
          "source": "/NS_Web/Wikipedia/",
          "resultid": "8222C7E2C32B433E94FD70BF84A1187B",
          "querylang": "en",
          "filename": "Bill_Gates",
          "fileext": "htm",
          "score": 0.81006,
          "sessionid": "2975368a-bb99-409f-b353-b1045efd3faa",
          "url": "https://localhost:4200/#/search/all?q=bill gates&t=all&id=/NS_Web/Wikipedia/|https://en.wikipedia.org/wiki/Bill_Gates"
        }
      }
    ]
  },
  "locale": "fr-FR",
  "noUserOverride": true,
  "noAutoAuthentication": true
}
```

### Example 1 — Log specific fields from the event

Extract the event type, document filename, and relevance score from each audit event:

```typescript title="src/app2/app.config.ts"
const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = resource instanceof Request ? resource.url : String(resource);

  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  if (config?.body) {
    try {
      const body = JSON.parse(config.body as string);
      const events = body.$auditRecord?.auditEvents ?? [];

      for (const event of events) {
        console.log(`[Audit] type=${event.type} | file=${event.detail?.filename} | score=${event.detail?.score}`);
        // Example output:
        // [Audit] type=Preview_Close | file=Bill_Gates | score=0.81006
      }
    } catch {
      // body is not JSON
    }
  }

  return originalFetch(resource, config);
};
```

---

### Example 2 — Enrich the payload before sending

Add a custom field to every audit event — for example a `customSource` property to tag where the event originated:

```typescript title="src/app2/app.config.ts"
const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = resource instanceof Request ? resource.url : String(resource);

  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  let modifiedConfig = config;

  if (config?.body) {
    try {
      const body = JSON.parse(config.body as string);
      const events = body.$auditRecord?.auditEvents ?? [];

      // Add a custom field to each audit event's detail
      for (const event of events) {
        event.detail = {
          ...event.detail,
          customSource: "my-app-v2"
        };
      }

      // Rebuild the config with the modified body
      modifiedConfig = {
        ...config,
        body: JSON.stringify(body)
      };
    } catch {
      // body is not JSON — send it unchanged
    }
  }

  return originalFetch(resource, modifiedConfig);
};
```

The server will now receive each event with an extra `customSource` field inside `detail`.

---

### Example 3 — Block a specific event type

Prevent `Preview_Close` events from being sent to the server entirely, by returning a fake successful response:

```typescript title="src/app2/app.config.ts"
const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = resource instanceof Request ? resource.url : String(resource);

  if (!url.includes("api/v1/audit")) {
    return originalFetch(resource, config);
  }

  if (config?.body) {
    try {
      const body = JSON.parse(config.body as string);
      const events = body.$auditRecord?.auditEvents ?? [];
      const hasBlockedEvent = events.some((e: { type: string }) => e.type === "Preview_Close");

      if (hasBlockedEvent) {
        console.warn("[Audit] Preview_Close event blocked.");
        // Return a fake 200 response so the app does not throw an error
        return new Response(JSON.stringify({ status: "blocked" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch {
      // body is not JSON
    }
  }

  return originalFetch(resource, config);
};
```

:::note
Returning a fake `Response` is safe here because the audit API response is not used by the application. If the API response drives UI logic, prefer logging and passing through instead of blocking.
:::

---

## Common use cases

| Goal | What to do |
| --- | --- |
| Log all audit events | Read `config.body` before calling `originalFetch` |
| Forward events to a third-party analytics tool | Call your analytics SDK inside the interceptor |
| Enrich events with custom fields | Modify `body.$auditRecord.auditEvents[].detail` before calling `originalFetch` |
| Handle audit failures differently | Check `response.ok` and trigger a notification |
| Block certain audit events | Return a mocked `Response` instead of calling `originalFetch` |

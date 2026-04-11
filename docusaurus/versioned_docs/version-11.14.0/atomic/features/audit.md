---
title: Audit
sidebar_class_name: update
---

The Audit module provides functions for sending audit events to the server and enriching request bodies with audit metadata (session ID, URL). It supports both direct audit notifications and automatic injection into API request bodies.

## Functions

### `Audit.notify()`

Sends audit events to the server.

:::caution
This function is accessed via the `Audit` namespace: `Audit.notify(...)`.
:::

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `auditEvents` | `AuditEvents` | ✓ | The audit events to send to the server |
| `addUrl` | `boolean` | | Whether to automatically include the current URL in event details. Default: `true` |

**Returns** `Promise<AuditEvents>` — the server response.

**Example**

```typescript title="audit-notify.ts"
import { Audit } from '@sinequa/atomic';

await Audit.notify({
  type: 'Search_Text',
  detail: { querytext: 'hello world' }
});
```

---

### `addAuditAdditionalInfo()`

Enriches a request body object with audit metadata: adds a session ID and optionally the current page URL to all audit events present in `body.$auditRecord`.

:::warning
This function mutates the `body` object via its reference. This behavior may change in a future version to ensure argument immutability.
:::

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `body` | `unknown` | ✓ | The request body object. Must have a `$auditRecord` property of type `AuditEvents`. |
| `addUrlParam` | `boolean` | | Whether to add the current page URL to audit event details. Default: `true` |

**Returns** `void`

**Example**

```typescript title="add-audit-info.ts"
import { addAuditAdditionalInfo } from '@sinequa/atomic';

const body = {
  action: 'save',
  userSettings,
  $auditRecord: {
    auditEvents: [{ type: 'Search_Text', detail: { querytext: 'hello' } }]
  }
};

addAuditAdditionalInfo(body);
// body.$auditRecord.auditEvents[0].detail now includes:
// { querytext: 'hello', sessionid: '...', url: 'https://...' }
```

---

## Types

### `AuditEvent`

```typescript
type AuditEvent = {
  type: AuditEventType | AuditEventTypeValues | string;
  detail?: Record<string, any>;
  rfmDetail?: {};
};
```

### `AuditEvents`

A composite type that accepts a single event, an array of events, or a full audit record:

```typescript
type AuditEvents = AuditEvent | AuditEvent[] | AuditRecord;
```

### `AuditRecord`

```typescript
type AuditRecord = {
  auditEvents?: AuditEvent[];
  mlAuditEvents?: any[];
};
```

### `AuditEventType`

The `AuditEventType` enum defines all standard audit event type strings. Custom string values are also accepted.

<details>
<summary>View all AuditEventType values</summary>

```typescript
enum AuditEventType {
  None = 'None',

  // Search events
  Search_FirstPage = 'Search_FirstPage',
  Search_Text = 'Search_Text',
  Search_Refine = 'Search_Refine',
  Search_Select_Item = 'Search_Select_Item',
  Search_GotoPage = 'Search_GotoPage',
  Search_ExportCSV = 'Search_ExportCSV',
  Search_Login_Success = 'Login_Success_Form',
  Search_QueryIntent_Detected = 'Search_QueryIntent_Detected',
  // ... and many more

  // Password events
  Change_Password_Failed = 'change.password.failed',
  Change_Password_Success_Form = 'change.password.success.form',
  Login_Denied = 'login.denied',
  Login_Success_Form = 'login.success.form',
  // ...
}
```
</details>

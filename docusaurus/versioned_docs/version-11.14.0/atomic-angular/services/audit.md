---
title: Audit
---

The `AuditService` notifies the Sinequa server of audit events such as login, logout, document interactions, and route changes.

:::note
Use the [`notify()`](/atomic/features/audit) function from `@sinequa/atomic` whenever possible. This service exists for compatibility with the Sinequa SDK.
:::

## Methods

### `notify()`

Notifies the server of a set of audit events.

```typescript
notify(auditEvents: AuditEvents): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `auditEvents` | `AuditEvents` | ✓ | The audit events to send. |

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AuditService } from '@sinequa/atomic-angular';

const auditService = inject(AuditService);
auditService.notify({ type: 'Custom_Event' });
```

### `notifyLogin()`

Sends a login success audit event.

```typescript
notifyLogin(): void
```

**Example**

```typescript
inject(AuditService).notifyLogin();
```

### `notifyLogout()`

Sends a logout audit event.

```typescript
notifyLogout(): void
```

**Example**

```typescript
inject(AuditService).notifyLogout();
```

### `notifyDocument()`

Notifies the server of a document interaction event.

```typescript
notifyDocument(
  auditEventType: AuditEventType | AuditEventTypeValues | {} & Record<never, never>,
  doc: Article,
  resultsOrId: Result | string,
  parameters?: Record<string, string | number | boolean | undefined>,
  rfmParameters?: Record<string, string | number | boolean | undefined>
): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `auditEventType` | `AuditEventType \| AuditEventTypeValues` | ✓ | The type of document audit event. |
| `doc` | `Article` | ✓ | The document (article) in question. |
| `resultsOrId` | `Result \| string` | ✓ | The result or result ID containing the document. |
| `parameters` | `Record<string, string \| number \| boolean \| undefined>` | | Additional parameters. |
| `rfmParameters` | `Record<string, string \| number \| boolean \| undefined>` | | Additional RFM parameters. |

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { AuditService } from '@sinequa/atomic-angular';

inject(AuditService).notifyDocument('Document_View', article, 'resultId123');
```

### `notifyRouteChange()`

Notifies the server of a route change event.

```typescript
notifyRouteChange(url: string): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `url` | `string` | ✓ | The URL of the new route. |

**Example**

```typescript
inject(AuditService).notifyRouteChange('/new-route');
```

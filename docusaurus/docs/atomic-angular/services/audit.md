---
title: Audit Service
---

## Overview

The `AuditService` class is responsible for notifying the Sinequa server of various audit events such as login, logout, document events, and route changes. Below are the details of each function provided by this service.

:::note
The AuditService is the same as the AuditService provided by the Sinequa SDK.  
This service is used to notify the Sinequa server of various audit events and exists to maintain the compatibility of the Angular application with the Sinequa SDK.

Use the [`notify()`](../../atomic/audit) function from the __@sinequa/atomic__ library whenever it's possible.
:::

### notify()

Notify the Sinequa server of a set of audit events.

```typescript
notify(auditEvents: AuditEvents): void
```

| Name        | Type        | Description                      |
|-------------|-------------|----------------------------------|
| `auditEvents` | `AuditEvents` | The audit events to notify. |

**Usage Example:**
```typescript
const auditEvents: AuditEvents = { type: "Custom_Event" };
auditService.notify(auditEvents);
```

### notifyLogin()

It sends a login success audit event to the Audit Service.


```typescript
notifyLogin(): void
```

**Usage Example:**
```typescript
auditService.notifyLogin();
```

### notifyLogout()

Notify the Sinequa server of a logout event.

```typescript
notifyLogout(): void
```

**Usage Example:**
```typescript
auditService.notifyLogout();
```

### notifyDocument()

Notify the Sinequa server of a document event.

```typescript
notifyDocument(
  auditEventType: AuditEventType | AuditEventTypeValues | {} & Record<never, never>,
  doc: Article,
  resultsOrId: Result | string,
  parameters?: Record<string, string | number | boolean | undefined>,
  rfmParameters?: Record<string, string | number | boolean | undefined>
): void
```

| Name            | Type                                                                 | Description                                                                 |
|-----------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `auditEventType`| `AuditEventType \| AuditEventTypeValues \| {} & Record<never, never>`| The audit event type.                                                       |
| `doc`           | `Article`                                                            | The document (article) in question.                                         |
| `resultsOrId`   | `Result \| string`                                                   | The result or result ID that contains the document.                         |
| `parameters`    | `Record<string, string \| number \| boolean \| undefined>`           | Optional. Additional parameters.                                            |
| `rfmParameters` | `Record<string, string \| number \| boolean \| undefined>`           | Optional. Additional RFM parameters.                                        |

**Usage Example:**
```typescript
const article: Article = { /* article details */ };
auditService.notifyDocument("Document_View", article, "resultId123", { param1: "value1" });
```

### notifyRouteChange()

Notify the Sinequa server of a route change event.

```typescript
notifyRouteChange(url: string): void
```

| Name | Type     | Description                |
|------|----------|----------------------------|
| `url`| `string` | The URL of the new route.  |

**Usage Example:**
```typescript
auditService.notifyRouteChange("/new-route");
```





































































































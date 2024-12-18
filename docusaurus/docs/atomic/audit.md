---
title: Audit
---


## Overview

The Audit module provides essential functions for managing audit-related activities in your application. These functions allow you to:

- Send audit events to the server for logging and tracking purposes
- Enhance existing data objects with additional audit information

By utilizing these capabilities, you can maintain comprehensive audit trails, track user actions, and enrich your application's data with valuable context for auditing and analysis.



### notify()
Notifies the server about audit events.

| parameter | type | description |
| --- | --- | --- |
| auditEvents | `AuditEvents` | The audit events to be sent to the server |

__Returns__ A promise that resolves to the updated audit events.

:::caution
Unlike others functions, this function is contained within an `Audit` namespace.
:::


#### Example
```js title="notify.js"
import { Audit } from "@sinequa/atomic";

const response = await Audit.notify({ 
  type: "Search_Text",
  details: {
    ...
  }
});

console.log("notify response", auditEvents);
// will display the response
```


### addAuditAdditionalInfo()
Adds additional audit information to the provided body object. As the _`body`_ reference is used here, the function does not returns nothing.


| parameter | type | description |
| --- | --- | --- |
| body | `unknown` | Reference to the body object to add audit information to |

:::caution
_`body`_ is modified via its reference.  
This is something that is likely to change in the future to ensure the immutability of the arguments.
:::

#### Example
```ts title="example-add-audit-additional-info.ts"
import { addAuditAdditionalInfo } from "@sinequa/atomic";

// arbitrary audit trail
const audit: { type: "audit-info", details: { id: "abc", message: "audit message" }}

const body = {
  action: "save",
  userSettings,
  $auditRecord:  { auditEvents: [audit] },
};

addAuditAdditionalInfo(body);
// `$auditRecord` will contains { auditEvents: [{ type: "audit-info", details: { id: "abc", message: "audit message", sessionId: "...", url: "..." } }]}
```
:::warning
The following functions are used internally, use them with caution.  
Prefers using the [`addAuditAdditionalInfo()`](#addauditadditionalinfo)
:::

### ensureAuditRecord(_obj_)
Handle legacy calls where auditEvents is either an AuditEvent, AuditEvent[] or AuditRecord.  

| parameter | type | description |
| --- | --- | --- |
| obj | `AuditEvents` | The object to be checked |

__Returns__ The AuditRecord if the object is valid, otherwise undefined.

### addSessionId()
Add a sessionid to all the audit events

| parameter | type | description |
| --- | --- | --- |
| auditRecord | `AuditRecord` | The audit record to modify. |

```js title="AuditRecord Type"
export type AuditRecord = {
    auditEvents?: AuditEvent[],
    mlAuditEvents?: any[]
}
```

__Returns__ The modified audit record with the session ID added.

### addUrl()
Add the URL to all the audit events

| parameter | type | description |
| --- | --- | --- |
| auditRecord | `AuditRecord` | The audit record to modify. |

__Returns__ The updated audit record with the URL added.

```js title="AuditRecord Type"
export type AuditRecord = {
    auditEvents?: AuditEvent[],
    mlAuditEvents?: any[]
}
```
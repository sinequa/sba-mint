---
title: Principal
sidebar_class_name: deprecated
---

:::warning Deprecated
Use `PrincipalStore` instead. `PrincipalService` will be removed in a future version.
:::

The `PrincipalService` is responsible for handling principal-related operations in the application. It provides methods to get the principal.

## Functions

### getPrincipal()

This method returns an observable that emits the principal object.  
[Principal](../../atomic/api/principal#fetchprincipal) object represents the current user.

```typescript
getPrincipal(): Observable<Principal>
```

#### Usage

```typescript
import { PrincipalService } from '@sinequa/atomic-angular';

principalService = inject(PrincipalService);

principalService.getPrincipal().subscribe(principal => {
  console.log(principal);
});
```

---
title: Principal
---

## Overview

Methods, and computed properties related to the principal.

## Computed values

### allowUsersOverride

A computed boolean indicating if user override is allowed based on the principal's administrator status and the `userOverrideActive` state.

### isOverridingUser

A computed boolean indicating if the user override is currently active.

## Basic Features
### initialize()

Initializes the principal store by fetching the principal data from the principal service.  
It patches the store with the fetched principal data and a user override active flag (`userOverrideActive`) from the global configuration.

```typescript
initialize(): void
```



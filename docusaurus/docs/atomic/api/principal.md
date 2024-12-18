---
sidebar_position: 2
title: Principal
---

## Overview
This module provides functionality for retrieving and managing user information. It allows:

- Fetching current user data from the backend
- Accessing user details such as name, email, and roles
- Determining user permissions and administrative status

These operations enable efficient user management and personalization within the application.


### fetchPrincipal()
Fetches the principal (current user) information from the backend API.

This function sends a GET request to the "principal" endpoint with specific
query parameters to retrieve the current user's data without triggering
automatic authentication.

__Returns__ A promise that resolves to the Principal object, representing the current user's information.

```js title="Principal Type"
export type Principal = {
    id: string,
    id2: string,
    id3: string,
    id4: string,
    id5: string,
    name: string,
    email: string,
    description: string,
    longName: string,
    userId: string,
    fullName: string,
    isAdministrator: boolean,
    isDelegatedAdmin: boolean,
    param1: string,
    param2: string,
    param3: string,
    param4: string,
    param5: string,
    param6: string,
    param7: string,
    param8: string,
    param9: string,
    param10: string
}
```

#### Example
```js title="example-fetch-principal.js"
import { fetchPrincipal } from "@sinequa/atomic";

const principal = await fetchPrincipal();
console.log("principal", principal);
// Output: a Principal object
```
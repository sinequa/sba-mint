---
title: Helpers
---

This module includes a variety of helper functions and utilities for common tasks


## Metadata

### getMetadata()
Retrieves metadata from an article object.

| parameter | type | description |
| --- | --- | --- |
| article | `Article` | The article object containing the metadata |
| metadata | [_KeyOf_](#code) &lt;`Article`&gt; | The key of the metadata to retrieve. |

__Returns__ An array of objects with a `display` property representing the metadata.

#### Example
```js title="get-metadata.js"
import { getMetadata } from "@sinequa/atomic";

// Sample article object
const article = {
  id: "123",
  title: "Sample Article",
  authors: ["John Doe", "Jane Smith"],
  publicationDate: "2023-05-15",
  keywords: ["technology", "science", "research"]
};

// Retrieve authors metadata
const authorsMetadata = getMetadata(article, "authors");
console.log("Authors:", authorsMetadata);
// Output: Authors: [{ display: "John Doe" }, { display: "Jane Smith" }]

// Retrieve publication date metadata
const dateMetadata = getMetadata(article, "publicationDate");
console.log("Publication Date:", dateMetadata);
// Output: Publication Date: [{ display: "2023-05-15" }]

// Retrieve keywords metadata
const keywordsMetadata = getMetadata(article, "keywords");
console.log("Keywords:", keywordsMetadata);
// Output: Keywords: [{ display: "technology" }, { display: "science" }, { display: "research" }]
```

## Typescript Type Alias

### KeyOf&lt;T&gt;
Type alias that extracts the keys of a given type `T`.

#### Example
```js title="example.js"
// Define a sample interface
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// Use the KeyOf<T> type alias
type UserStringKeys = KeyOf<User>;
// Equals to: type UserStringKeys = "id" | "name" | "email" | "age" | "isActive"

// Example usage
const userKey: UserStringKeys = "name";

// This would be valid
const validKey: UserStringKeys = "email";

console.log("Valid user key:", userKey);
// Output: Valid user key: name

// Function that uses KeyOf<T>
function getUserProperty(user: User, key: KeyOf<User>): string {
  return String(user[key]);
}

const sampleUser: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  isActive: true
};

console.log(getUserProperty(sampleUser, "name")); // Output: John Doe
console.log(getUserProperty(sampleUser, "email")); // Output: john@example.com

```

## Misc
### isObject()
Checks if the given value is an object.

| parameter | type | description |
| --- | --- | --- |
| obj | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is an object, false otherwise.

#### Example
```js title="is-object.js"
import { isObject } from "@sinequa/atomic";

console.log(isObject(null));      // Output: false
console.log(isObject(undefined)); // Output: false
console.log(isObject(42));        // Output: false
console.log(isObject("test"));    // Output: false
console.log(isObject([]));        // Output: true
console.log(isObject({}));        // Output: true
``` 

### isArrayBuffer()
Checks if the given value is an ArrayBuffer.

| parameter | type | description |
| --- | --- | --- |
| value | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is an ArrayBuffer, false otherwise.

#### Example
```js title="is-array-buffer.js"
import { isArrayBuffer } from "@sinequa/atomic";

console.log(isArrayBuffer(null));      // Output: false
console.log(isArrayBuffer(undefined)); // Output: false
console.log(isArrayBuffer(42));        // Output: false
console.log(isArrayBuffer("test"));    // Output: false
console.log(isArrayBuffer([]));        // Output: false
console.log(isArrayBuffer({}));        // Output: false
console.log(isArrayBuffer(new ArrayBuffer(10))); // Output: true
```

### isBlob()
Checks if the given value is a Blob.

| parameter | type | description |
| --- | --- | --- |
| value | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is a Blob, false otherwise.

#### Example
```js title="is-blob.js"
import { isBlob } from "@sinequa/atomic";

console.log(isBlob(null));      // Output: false
console.log(isBlob(undefined)); // Output: false
console.log(isBlob(42));        // Output: false
console.log(isBlob("test"));    // Output: false
console.log(isBlob([]));        // Output: false
console.log(isBlob({}));        // Output: false
console.log(isBlob(new ArrayBuffer(10))); // Output: false
console.log(isBlob(new Blob())); // Output: true
```

### isString()
Checks if the given value is a string.

| parameter | type | description |
| --- | --- | --- |
| value | `unknown` | The value to check |

__Returns__ `boolean`: True if the value is a string, false otherwise.

#### Example
```js title="is-string.js"
import { isString } from "@sinequa/atomic";

console.log(isString(null));      // Output: false
console.log(isString(undefined)); // Output: false
console.log(isString(42));        // Output: false
console.log(isString("test"));    // Output: true
console.log(isString([]));        // Output: false
console.log(isString({}));        // Output: false
```

### isJsonable()
Checks if the given value can be safely converted to JSON.

| parameter | type | description |
| --- | --- | --- |
| obj | `unknown` | The value to check |

__Returns__ `boolean`: True if the value can be safely converted to JSON, false otherwise.

#### Example
```js title="is-jsonable.js"
import { isJsonable } from "@sinequa/atomic";

console.log(isJsonable(null));      // Output: false
console.log(isJsonable(undefined)); // Output: false
console.log(isJsonable(42));        // Output: false
console.log(isJsonable("test"));    // Output: false
console.log(isJsonable([]));        // Output: true
console.log(isJsonable({}));        // Output: true
console.log(isJsonable(new ArrayBuffer(10))); // Output: false
console.log(isJsonable(new Blob())); // Output: false
```

### guid()
Generates a globally unique identifier (GUID).

| parameter | type | description |
| --- | --- | --- |
| withHypens | `boolean` | Optional. If true, includes hyphens in the GUID. Default is true. |

__Returns__ `string`: A newly generated GUID.

#### Example
```js title="guid-with-hypens.js"
  import { guid } from "@sinequa/atomic";

  console.log(guid());
  // Output: "550e8400-e29b-41d4-a716-446655440000" (example GUID)
```
```js title="guid-without-hyphens.js"
import { guid } from "@sinequa/atomic";

console.log(guid(false));
// Output: "550e8400e29b41d4a716446655440000" (example GUID without hyphens)
```

### escapeExpr()
Escape a string so that the characters in it are not processed by the fielded search expression parser.
Single occurrences of the backslash character are replaced by two backslashes and backquote characters
are prefixed by a backslash. Finally, the string is enclosed in backquotes.

| parameter | type | description |
| --- | --- | --- |
| expression | `string` | Optional |

:::tip examples
```text
`` a\`\b `` => `` a\\\`\\b ``   
\ => \\  
` => \`  
```
:::

:::caution
This function has very specific use cases.
:::

#### Example
```js title="escapeExpr.js"
import { escapeExpr } from "@sinequa/atomic";

const value = "web/wikipedia/*";
const column = "source";
const expr = `${column}: ${escapeExpr(value)}`;
console.log(expr); // Output: "source: `web/wikipedia/*`

console.log(escapeExpr(undefined)); // Output: ``
console.log(escapeExpr(""));        // Output: ``
console.log(escapeExpr("test"));    // Output: `test`
console.log(escapeExpr("a\\b"));    // Output: `a\\\\b`
console.log(escapeExpr("a`b"));     // Output: `a\\`b`
console.log(escapeExpr("a\\`b"));   // Output: `a\\\\\\`b`
```

### sha512()
Computes the SHA-512 hash of the given value.

| parameter | type | description |
| --- | --- | --- |
| value | `string` | The value to hash |

__Returns__ `string`: The SHA-512 hash of the input value.

#### Example
```js title="sha512.js"
import { sha512 } from "@sinequa/atomic";

console.log(sha512("test"));
// Output: "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff"
```

### resolveToColumnName()
Resolves an alias to a column name from a query or indexes schema

| parameter | type | description |
| --- | --- | --- |
| alias | `string` | The alias of the column to resolve |
| app | `CCApp` | The application state object |
| queryName | `string` | Optional. The name of the query to use for resolution |

#### Example
```js title="resolve-to-column-name.js"
import { resolveToColumnName } from "@sinequa/atomic";

const alias = 'recordType';
const appObject = { /* ... */ }; // Assuming this is your CCApp object
const queryName = 'main_query';

const resolved = resolveToColumnName(alias, appObject, queryName);
console.log(resolved); // Output: 'sourcestr1'
```
---
title: KeyOf
---

Type alias that extracts the keys of a given type `T`.

#### Example

```js title="example.js"
import { KeyOf } from '@sinequa/atomic';

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

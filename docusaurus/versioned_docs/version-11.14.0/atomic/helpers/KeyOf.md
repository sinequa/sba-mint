---
title: KeyOf
---

A TypeScript utility type that extracts the union of all keys from a given type `T`. Equivalent to `keyof T` with string-only filtering.

**Type Definition**

```typescript
type KeyOf<T> = keyof T;
```

**Example**

```typescript title="key-of.ts"
import type { KeyOf } from '@sinequa/atomic';

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

type UserKey = KeyOf<User>;
// 'id' | 'name' | 'email' | 'isActive'

function getUserProperty(user: User, key: KeyOf<User>): unknown {
  return user[key];
}

const user: User = { id: 1, name: 'John', email: 'john@example.com', isActive: true };
console.log(getUserProperty(user, 'name'));  // 'John'
console.log(getUserProperty(user, 'email')); // 'john@example.com'
```

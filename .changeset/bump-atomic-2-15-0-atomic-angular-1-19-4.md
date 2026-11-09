---
"sinequa-mint": patch
---

Bump `@sinequa/atomic` to 2.15.0 and `@sinequa/atomic-angular` to 1.19.4. Fixes the tab counts that were lost when a tree aggregation node is opened, and the deletion/saving of custom user-profile properties that have no stored value. The JWT refresh now also refreshes the bearer token, the user profile client handles bare-value responses, and APIs served under a path prefix are supported through the new `apiPrefix` option.

---
"sinequa-mint": patch
---

Fix the Agent page prompt dialogs (delete saved chat, rename, like, dislike) being displayed at the top-left of the screen without a backdrop: import `@sinequa/agent/css/utilities.css` so the `agt-*` utilities are defined.

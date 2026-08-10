---
title: SelectionStrategy
sidebar_class_name: new
---

`SelectionStrategy` is a union type that defines how `SelectArticleDirective` handles article selection.

## Type definition

```typescript
type SelectionStrategy = 'replace' | 'stack' | 'redirect' | 'emit';
```

| Value | Description |
|-------|-------------|
| `'replace'` | Replaces the current article in the selection store (default). |
| `'stack'` | Pushes the article onto the selection history stack. |
| `'redirect'` | Navigates to the configured `redirectUrl` with the article. |
| `'emit'` | Emits the `selected` output event without touching the store. |

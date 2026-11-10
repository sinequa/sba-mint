---
title: Application
---

The `ApplicationStore` manages application-level flags (ready state, extracts) used by the Mint framework. It can be extended to add custom application state.

:::info
This store provides basic features you can easily extend to create your own application store.
:::

## Methods

### `update()`

Updates the application state with the provided partial state.

```typescript
update(state: Partial<ApplicationState>): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `state` | `Partial<ApplicationState>` | ✓ | Partial state object with properties to update. |

### `updateReadyState()`

Sets the ready flag on the application store.

```typescript
updateReadyState(value?: boolean): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `boolean` | | The ready state to set. Default: `true`. |

### `updateExtracts()`

Stores extract data for a given document ID.

```typescript
updateExtracts(id: string, extracts: Extract[]): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `id` | `string` | ✓ | The document ID. |
| `extracts` | `Extract[]` | ✓ | The extracts to store for that document. |

### `getExtracts()`

Retrieves stored extracts for a given document ID.

```typescript
getExtracts(id: string): Extract[]
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `id` | `string` | ✓ | The document ID. |

**Returns** `Extract[]` — the extracts for that document.

## Computed values

### `extractsCount`

**Returns** `number` — the total number of stored extracts.

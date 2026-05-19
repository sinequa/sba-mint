---
title: Application
---

This is our Application's store. Here we can manage differents flags used by __"Mint"__

:::info
This store provide basic features you can easly inherits to create your own application's store
:::

## Basic features

### update()

Updates the application state with the provided state properties.

```typescript
update(state: Partial<ApplicationState>): void
```

| Parameter | Type                    | Description                                      |
|-----------|-------------------------|--------------------------------------------------|
| `state`     | `Partial<ApplicationState>` | The partial state object containing properties to update. |

### updateReadyState()

Updates the ready state of the application store.

```typescript
updateReadyState(value: boolean = true): void
```

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| `value`     | `boolean`  | Optional. The ready state to set. Defaults to true. |

## Extracts features

### extractsCount

Get the extracts count.

### updateExtracts()

Updates the extracts for a given ID in the application store.

```typescript
updateExtracts(id: string, extracts: Extract[]): void
```

| Parameter | Type     | Description                          |
|-----------|----------|--------------------------------------|
| `id`        | `string`   | The ID of the extracts to update.    |
| `extracts`  | `Extract[]`| The extracts to set for the given ID.|

### getExtracts()

Retrieves extracts from the store based on the provided ID.

```typescript
getExtracts(id: string): Extract[]
```

| Parameter | Type     | Description                          |
|-----------|----------|--------------------------------------|
| `id`        | `string`   | The ID of the extracts to retrieve.  |

---
title: Application
---

## Overview

This is our Application's store. Here we can manage differents flags used by __"Mint"__  

:::info
This store provide basic features you can easly inherits to create your own application's store
:::

## Basic features
### updateAssistantReady()

Updates the application state to indicate that the assistant is ready.  
This function patches the current state by setting the `assistantReady` property to `true`.

```typescript	
updateAssistantReady(): void
```

### updateReadyState()

Updates the ready state of the application store to true.  
This function patches the current state of the store by setting the `ready` property to `true`.

```typescript
updateReadyState(): void
```

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
  | id        | string   | The ID of the extracts to update.    |
  | extracts  | Extract[]| The extracts to set for the given ID.|


### getExtracts()

Retrieves extracts from the store based on the provided ID.
  
  ```typescript
  getExtracts(id: string): Extract[]
  ```
  | Parameter | Type     | Description                          |
  |-----------|----------|--------------------------------------|
  | id        | string   | The ID of the extracts to retrieve.  |

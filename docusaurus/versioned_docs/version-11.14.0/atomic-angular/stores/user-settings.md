---
title: User Settings
---

The `UserSettingsStore` manages user preferences and settings, including language, theme, bookmarks, recent searches, saved searches, baskets, and alerts. It persists state to the backend API and keeps the store in sync.

## Methods

### `initialize()`

Initializes the store by fetching user settings from the backend API and patching the store.

```typescript
initialize(): Promise<void>
```

### `reset()`

Resets the store to its initial state.

```typescript
reset(): Promise<void>
```

## Bookmark features

### `updateBookmarks()`

Updates the user's bookmarks in the store and optionally logs audit events.

```typescript
updateBookmarks(bookmarks: UserSettings['bookmarks'], auditEvents?: AuditEvents): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `bookmarks` | `UserSettings['bookmarks']` | ✓ | The new bookmarks to store. |
| `auditEvents` | `AuditEvents` | | Optional audit events to log. |

### `bookmark()`

Adds an article to the bookmarks if it is not already bookmarked.

```typescript
bookmark(article: Article, queryName?: string): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `article` | `Article` | ✓ | The article to bookmark. |
| `queryName` | `string` | | The query name associated with the article. |

### `unbookmark()`

Removes a bookmark by its ID.

```typescript
unbookmark(id: string): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `id` | `string` | ✓ | The ID of the bookmark to remove. |

### `isBookmarked()`

Checks whether the given article is bookmarked.

```typescript
isBookmarked(article: Partial<Article>): boolean
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `article` | `Partial<Article>` | ✓ | The article to check. |

**Returns** `boolean` — `true` if the article is bookmarked.

### `toggleBookmark()`

Toggles the bookmark status of a given article.

```typescript
toggleBookmark(article: Article): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `article` | `Article` | ✓ | The article whose bookmark status to toggle. |

## Recent Searches features

### `deleteRecentSearch()`

Deletes a recent search entry by its index.

```typescript
deleteRecentSearch(index: number): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `index` | `number` | ✓ | The index of the recent search to delete. |

### `updateRecentSearches()`

Updates the user's recent searches and optionally logs audit events.

```typescript
updateRecentSearches(recentSearches: UserSettings['recentSearches'], auditEvents?: AuditEvents): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `recentSearches` | `UserSettings['recentSearches']` | ✓ | The new recent searches to store. |
| `auditEvents` | `AuditEvents` | | Optional audit events to log. |

### `addCurrentSearch()`

Adds the current search to the recent searches list.

```typescript
addCurrentSearch(queryParams: QueryParams): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `queryParams` | `QueryParams` | ✓ | The parameters of the current search. |

## Saved Searches features

### `deleteSavedSearch()`

Deletes a saved search entry by its index.

```typescript
deleteSavedSearch(index: number): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `index` | `number` | ✓ | The index of the saved search to delete. |

### `updateSavedSearches()`

Updates the user's saved searches in the store.

```typescript
updateSavedSearches(savedSearches: UserSettings['savedSearches']): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `savedSearches` | `UserSettings['savedSearches']` | ✓ | The new saved searches to store. |

## Baskets features

### `deleteBasket()`

Deletes a basket by its index.

```typescript
deleteBasket(index: number): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `index` | `number` | ✓ | The index of the basket to delete. |

### `createBasket()`

Adds a basket to the user's baskets list.

```typescript
createBasket(basket: Basket): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `basket` | `Basket` | ✓ | The basket to add. |

### `updateBaskets()`

Replaces the full baskets list in the store.

```typescript
updateBaskets(baskets: UserSettings['baskets']): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `baskets` | `UserSettings['baskets']` | ✓ | The new baskets to store. |

### `updateBasket()`

Updates the basket at a specific index.

```typescript
updateBasket(basket: Basket, index: number): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `basket` | `Basket` | ✓ | The updated basket data. |
| `index` | `number` | ✓ | The index of the basket to update. |

### `addToBasket()`

Adds one or multiple record IDs to a named basket.

```typescript
addToBasket(name: string, ids: string | string[]): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `name` | `string` | ✓ | The basket name. |
| `ids` | `string \| string[]` | ✓ | The record ID(s) to add. |

### `removeFromBasket()`

Removes one or multiple record IDs from a named basket.

```typescript
removeFromBasket(name: string, ids: string | string[]): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `name` | `string` | ✓ | The basket name. |
| `ids` | `string \| string[]` | ✓ | The record ID(s) to remove. |

## Alert features

### `deleteAlert()`

Deletes an alert by its index.

```typescript
deleteAlert(index: number): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `index` | `number` | ✓ | The index of the alert to delete. |

### `createAlert()`

Adds an alert to the user's alerts list.

```typescript
createAlert(alert: Alert): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `alert` | `Alert` | ✓ | The alert to add. |

### `updateAlert()`

Updates the alert at a specific index.

```typescript
updateAlert(alert: Alert, index: number): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `alert` | `Alert` | ✓ | The updated alert data. |
| `index` | `number` | ✓ | The index of the alert to update. |

### `updateAlerts()`

Replaces the full alerts list in the store.

```typescript
updateAlerts(alerts: Alert[]): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `alerts` | `Alert[]` | ✓ | The new alerts to store. |

## Assistant features

### `updateAssistantSettings()`

Updates the user's assistant settings in the store.

```typescript
updateAssistantSettings(assistantSettings: UserSettings['assistants']): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `assistantSettings` | `UserSettings['assistants']` | ✓ | The new assistant settings. |

### `updateLanguage()`

Updates the user's language preference and optionally logs audit events.

```typescript
updateLanguage(language: UserSettings['language'], auditEvents?: AuditEvents): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `language` | `UserSettings['language']` | ✓ | The language to set. |
| `auditEvents` | `AuditEvents` | | Optional audit events to log. |

### `updateAssistantCollapsed()`

Updates the assistant's collapsed state and optionally logs audit events.

```typescript
updateAssistantCollapsed(collapseAssistant: UserSettings['collapseAssistant'], auditEvents?: AuditEvents): Promise<void>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `collapseAssistant` | `UserSettings['collapseAssistant']` | ✓ | The new collapsed state. |
| `auditEvents` | `AuditEvents` | | Optional audit events to log. |

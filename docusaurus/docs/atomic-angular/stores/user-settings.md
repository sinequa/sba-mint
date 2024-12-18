---
title: User Settings
---

## Overview

This store is used to manage the user settings. It is used to store the user's preferences and settings, such as the language, the theme, and the highlights.

## Basic features

### initialize()

Initializes the user settings store by fetching the user settings from the backend API
and patching the store with the retrieved settings.

```typescript	
initialize(): void
```

### reset()

Resets the user settings store to its initial state.

```typescript
reset(): void
```

## Bookmark features

### updateBookmarks()

Updates the user's bookmarks in the store and optionally logs audit events.

```typescript
updateBookmarks(bookmarks: UserSettings['bookmarks'], auditEvents?: AuditEvents): void
```

| Parameter    | Type                              | Description                                      |
|--------------|-----------------------------------|--------------------------------------------------|
| bookmarks  | `UserSettings['bookmarks']`       | The new bookmarks to be updated in the store.    |
| auditEvents| `AuditEvents`          | Optional. Events to be logged for auditing purposes.       |


### bookmark()

Adds an article to the bookmarks if it is not already bookmarked.

```typescript
bookmark(article: Article, queryName?: string): void
```
| Parameter  | Type                | Description                                      |
|------------|---------------------|--------------------------------------------------|
| article  | `Article`           | The article to be bookmarked.                    |
| queryName| `string` | Optional. The name of the query associated with the article.|

### unbookmark()

Removes an article from the bookmarks if it is bookmarked.

```typescript
unbookmark(id: string): void
```

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| id      | `string` | The ID of the article to unbookmark.  |

### isBookmarked()

Checks if an article is bookmarked.

```typescript
isBookmarked(article: Partial<Article>): boolean
```

| Parameter | Type           | Description                           |
|-----------|----------------|---------------------------------------|
| article | `Partial<Article>` | The article to check if it is bookmarked.|

### toggleBookmark()

Toggles the bookmark status of an article.

```typescript
toggleBookmark(article: Article): void
```

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| article | `Article`| The article to toggle the bookmark.    |

## Recent Searches features

### deleteRecentSearch()

Deletes a recent search entry from the user's recent searches list.

```typescript
deleteRecentSearch(index: number): void
```

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| index      | `number` | The index of the recent search to delete.|

### updateRecentSearches()

Updates the user's recent searches in the store and optionally logs audit events.

```typescript
updateRecentSearches(recentSearches: UserSettings['recentSearches'], auditEvents?: AuditEvents): void
```

| Parameter    | Type                              | Description                                      |
|--------------|-----------------------------------|--------------------------------------------------|
| recentSearches  | `UserSettings['recentSearches']`       | The new recent searches to be updated in the store.    |
| auditEvents| `AuditEvents`          | Optional. Events to be logged for auditing purposes.       |


### addCurrentSearch()

Adds the current search query to the user's recent searches.

```typescript
addCurrentSearch(queryParams: QueryParams): void
```

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| queryParams | `QueryParams` | The query parameters of the current search.|


## Saved Searches features

### deleteSavedSearch()

Deletes a saved search entry from the user's saved searches list.

```typescript
deleteSavedSearch(index: number): void
```

| Parameter | Type     | Description                           |
|-----------|----------|---------------------------------------|
| index      | `number` | The index of the saved search to delete.|

### updateSavedSearches()

Updates the user's saved searches in the store and optionally logs audit events.

```typescript
updateSavedSearches(savedSearches: UserSettings['savedSearches'], auditEvents?: AuditEvents): void
```

| Parameter    | Type                              | Description                                      |
|--------------|-----------------------------------|--------------------------------------------------|
| savedSearches  | `UserSettings['savedSearches']`       | The new saved searches to be updated in the store.    |
| auditEvents| `AuditEvents`         | Optional. Events to be logged for auditing purposes.       |

## Assistant features

### updateAssistant()

Updates the user's assistant settings in the store and optionally logs audit events.

```typescript
updateAssistant(assistant: UserSettings['assistant']): void
```

| Parameter    | Type                              | Description                                      |
|--------------|-----------------------------------|--------------------------------------------------|
| assistant  | `UserSettings['assistant']`       | The new assistant settings to be updated in the store.    |


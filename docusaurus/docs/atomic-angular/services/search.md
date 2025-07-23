---
title: Search
sidebar_class_name: deprecated
---

The `SearchService` is responsible for performing search operations and managing search navigation. It handles query parameters, navigation state, and audit trails.

## Functions

### search()

Executes a search operation with the given commands and options.

```typescript
search(commands: string[], options: SearchOptions = { appendFilters: true }): void
```

| Parameter   | Type            | Description                                                                |
|-------------|-----------------|----------------------------------------------------------------------------|
| `commands`  | `string[]`      | An array of strings representing the search commands.                      |
| `options`   | `SearchOptions` | An optional object containing search options.                              |
| `options.appendFilters` | `boolean` | Whether to append existing filters to the search query. Default: `true` |
| `options.audit` | `AuditEvents` | An optional audit trail object to be stored in the navigation state. |

The method constructs query parameters based on the current state and the provided options, then navigates to the specified commands with the constructed query parameters and audit trail.

### getResult()

Retrieves the search result based on the provided query.

```typescript
getResult(q: Partial<Query>): Observable<Result>
```

| Parameter | Type             | Description                                |
|-----------|-----------------|--------------------------------------------|
| `q`       | `Partial<Query>` | A partial query object containing search parameters. |

#### Returns

`Observable<Result>` - An Observable that emits the search result.

This method performs the following actions:

- Creates an audit event with the type "Search_Text" and the query text.
- Resets the audit property to undefined.
- Calls the search method of the queryService with the query, a flag to include the query name in records, and the audit event.
- Handles any errors by returning an empty Result object.
- Maps the search result to the service's result property.

### gotoPage()

Navigates to the specified page and returns the search result.

```typescript
gotoPage(page: number): void
```

| Parameter | Type     | Description                  |
|-----------|----------|------------------------------|
| `page`    | `number` | The page number to navigate to. |

**Usage Example:**

```typescript
searchService.gotoPage(2);
```

This method updates the page number in the query parameters store and triggers a new search with audit information about the page navigation.

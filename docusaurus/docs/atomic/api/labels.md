---
title: Labels
sidebar_class_name: new
---

The Labels module provides functions to manage labels (tags) on documents. All operations are available through the `labels` namespace object. Labels can be public or private and can be applied to individual documents or in bulk via a query.

## Functions

All functions are accessed via the `labels` namespace:

```typescript
import { labels } from '@sinequa/atomic';
```

### `labels.getUserRights()`

Fetches the current user's rights for label management.

**Returns** `Promise<LabelsRights>` — the user's label rights for the current application.

**Example**

```typescript title="get-user-rights.ts"
import { labels } from '@sinequa/atomic';

const rights = await labels.getUserRights();
console.log('Can manage labels:', rights);
```

---

### `labels.add()`

Adds one or more labels to specific documents.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `labelList` | `string[]` | ✓ | Array of label names to add |
| `ids` | `string[]` | ✓ | Array of document IDs to label |
| `publicOnly` | `boolean` | | If `true`, labels are public. Default: `true` |

**Returns** `Promise<void>`

**Example**

```typescript title="add-labels.ts"
import { labels } from '@sinequa/atomic';

await labels.add(['important', 'reviewed'], ['doc-id-1', 'doc-id-2']);
```

---

### `labels.remove()`

Removes one or more labels from specific documents.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `labelList` | `string[]` | ✓ | Array of label names to remove |
| `ids` | `string[]` | ✓ | Array of document IDs |
| `publicOnly` | `boolean` | | If `true`, operates on public labels only. Default: `true` |

**Returns** `Promise<void>`

**Example**

```typescript title="remove-labels.ts"
import { labels } from '@sinequa/atomic';

await labels.remove(['draft'], ['doc-id-1']);
```

---

### `labels.rename()`

Renames one or more labels to a new label name.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `labelList` | `string[]` | ✓ | Array of label names to rename |
| `newLabel` | `string` | ✓ | The new label name |
| `publicOnly` | `boolean` | | If `true`, operates on public labels only. Default: `true` |

**Returns** `Promise<void>`

**Example**

```typescript title="rename-labels.ts"
import { labels } from '@sinequa/atomic';

await labels.rename(['old-name'], 'new-name');
```

---

### `labels.delete()`

Deletes one or more labels entirely.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `labelList` | `string[]` | ✓ | Array of label names to delete |
| `publicOnly` | `boolean` | | If `true`, deletes public labels only. Default: `true` |

**Returns** `Promise<void>`

**Example**

```typescript title="delete-labels.ts"
import { labels } from '@sinequa/atomic';

await labels.delete(['obsolete-label']);
```

---

### `labels.bulkAdd()`

Adds labels to all documents matching a query.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `labelList` | `string[]` | ✓ | Array of labels to add |
| `query` | `Query` | ✓ | Query whose matching documents receive the labels |
| `publicOnly` | `boolean` | | If `true`, labels are public. Default: `true` |

**Returns** `Promise<void>`

**Example**

```typescript title="bulk-add-labels.ts"
import { labels } from '@sinequa/atomic';

await labels.bulkAdd(['quarterly-review'], { name: '_query', text: 'Q1 2024 report' });
```

---

### `labels.bulkRemove()`

Removes labels from all documents matching a query.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `labelList` | `string[]` | ✓ | Array of labels to remove |
| `query` | `Query` | ✓ | Query whose matching documents lose the labels |
| `publicOnly` | `boolean` | | If `true`, operates on public labels only. Default: `true` |

**Returns** `Promise<void>`

**Example**

```typescript title="bulk-remove-labels.ts"
import { labels } from '@sinequa/atomic';

await labels.bulkRemove(['draft'], { name: '_query', text: 'published documents' });
```

---
title: Preview
sidebar_class_name: update
---

The `PreviewService` manages document previews: fetching preview data, communicating with the preview iframe, and controlling highlight visibility.

## Methods

### `preview()`

Fetches preview data for a document.

```typescript
preview(id: string, q: Partial<Query>, customHighlights?: CustomHighlights[], audit?: AuditEvents): Observable<PreviewData>
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `id` | `string` | ✓ | The document ID to preview. |
| `q` | `Partial<Query>` | ✓ | Query parameters for the preview. |
| `customHighlights` | `CustomHighlights[]` | | Additional custom highlights. |
| `audit` | `AuditEvents` | | Audit events to log. |

**Returns** `Observable<PreviewData>` — emits the preview data.

**Example**

```typescript title="example.component.ts"
import { inject } from '@angular/core';
import { PreviewService } from '@sinequa/atomic-angular';

inject(PreviewService).preview('documentId', { text: 'query' }).subscribe(data => {
  console.log(data);
});
```

### `close()`

Closes a preview and updates the audit log.

```typescript
close(id: string, query: Partial<Query>): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `id` | `string` | ✓ | The document ID of the preview to close. |
| `query` | `Partial<Query>` | ✓ | The query used when the preview was opened. |

### `openExternal()`

Opens an article in a new browser tab.

```typescript
openExternal(article: Article): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `article` | `Article` | ✓ | The article to open externally. |

### `setIframe()`

Sets the preview iframe window reference.

```typescript
setIframe(iframe: Window | null): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `iframe` | `Window \| null` | ✓ | The iframe window, or `null` to unset. |

### `setPreviewData()`

Sets the preview data and updates the active highlight category.

```typescript
setPreviewData(data: PreviewData): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `data` | `PreviewData` | ✓ | The preview data to set. |

### `sendMessage()`

Sends a message to the preview iframe.

```typescript
sendMessage(message: unknown): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `message` | `unknown` | ✓ | The message payload. |

### `retrieveHtmlContent()`

Sends a message to the iframe to retrieve HTML content for a specific highlight category.

```typescript
retrieveHtmlContent(id: string, highlightCategory: string, previewData: PreviewData): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `id` | `string` | ✓ | Unique identifier for the request. |
| `highlightCategory` | `string` | ✓ | The highlight category to retrieve. |
| `previewData` | `PreviewData` | ✓ | Preview data with highlight locations. |

### `zoomIn()`

Sends a zoom-in message to the preview iframe.

```typescript
zoomIn(): void
```

### `zoomOut()`

Sends a zoom-out message to the preview iframe.

```typescript
zoomOut(): void
```

### `toggleAIDescription()`

Enables or disables the AI description in the preview.

```typescript
toggleAIDescription(enabled: boolean): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `enabled` | `boolean` | ✓ | `true` to enable the AI description. |

### `toggle()`

Toggles extract and entity highlights in the preview.

```typescript
toggle(extracts: boolean, entities: boolean): void
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `extracts` | `boolean` | ✓ | Whether to show extract highlights. |
| `entities` | `boolean` | ✓ | Whether to show entity highlights. |

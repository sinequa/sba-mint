---
title: Preview Service
---

## Overview
The `PreviewService` is responsible for handling the preview of documents, including fetching and displaying highlighted extracts and entities.

### receiveMessage()

Handles incoming messages from a MessageEvent.

The function processes messages of type 'ready' and 'get-html-results'.

- For 'ready' messages:
   - Initializes the preview iframe with the app name and highlights.
   - If preview data is available, retrieves HTML content based on the current selection.

 - For 'get-html-results' messages:
   - Updates the application store with the extracted HTML results.
   - If no extracts are found, updates the application store with an empty array.

```typescript
receiveMessage(
  event: MessageEvent
): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `event`           | `MessageEvent`       | The MessageEvent containing the message data.              |

**Usage Example:**

```typescript
window.addEventListener('message', this.previewService.receiveMessage.bind(this));
```

### preview()

Previews the data for a given ID and query.

```typescript
preview(
  id: string, 
  q: Partial<Query>, 
  customHighlights?: CustomHighlights[], 
  audit?: AuditEvents
): Observable<PreviewData>
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `id`              | `string`            | The ID to preview.                               |
| `query`           | `Partial<Query>`    | The query parameters for the preview.            |
| `customHighlights`| `CustomHighlights[]`| (Optional) Custom highlights for the preview.    |
| `audit`           | `AuditEvents`       | (Optional) The audit events to log.              |

**Usage Example:**

```typescript
this.previewService.preview('documentId', { text: 'query' }).subscribe(data => {
  console.log('Preview data:', data);
});
```

```typescript
this.previewService.preview('documentId', { text: 'query' }, customHighlights).subscribe(data => {
  console.log('Preview data:', data);
});
```

### close()

Closes the preview with the specified ID and updates the audit log.

```typescript
close(id: string, query: Partial<Query>): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `id`      | `string`         | The ID of the preview to close.                  |
| `query`   | `Partial<Query>` | The partial query object used to retrieve the preview detail. |

**Usage Example:**

```typescript
this.previewService.close('documentId', { text: 'query' });
```

### openExternal()

Previews an article in a new browser's tab.

```typescript
openExternal(article: Article): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `article` | `Article`| The article to preview.  |

**Usage Example:**

```typescript
this.previewService.openExternal(article);
```

### setIframe()

Sets the iframe window object.

```typescript
setIframe(iframe: Window | null): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `iframe`  | `Window \| null` | The window object of the iframe or null to unset. |

**Usage Example:**

```typescript
this.previewService.setIframe(window);
```

### setPreviewData()

Sets the preview data and updates the highlight category based on the provided data.

```typescript
setPreviewData(data: PreviewData): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `data`    | `PreviewData`| The preview data to be set.                      |

**Usage Example:**

```typescript
this.previewService.setPreviewData(previewData);
```

### sendMessage()

Sends a message to the iframe if it exists.

```typescript
sendMessage(message: unknown): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `message` | `unknown` | The message to be sent. It can be of any type. |

**Usage Example:**

```typescript
this.previewService.sendMessage({ type: 'message' });
```

```typescript
this.previewService.sendMessage({ action: 'init' });
```

### retrieveHtmlContent()

Send a message to the preview iFrame with the required data to retrieve HTML content for a specific highlight category.

```typescript
retrieveHtmlContent(id: string, highlightCategory: string, previewData: PreviewData): void
```

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `id`               | `string`      | The unique identifier for the request.           |
| `highlightCategory`| `string`      | The category of highlights to retrieve.          |
| `previewData`      | `PreviewData` | The data containing highlights and their locations. |

**Usage Example:**

```typescript
this.previewService.retrieveHtmlContent('documentId', 'highlightCategory', previewData);
```

### zoomIn()

Sends a message to zoom in the preview.

```typescript
this.previewService.zoomIn();
```

### zoomOut()

Sends a message to zoom out the preview.

```typescript
this.previewService.zoomOut();
```

### toggle()

Toggles the highlights based on the provided flags for extracts and entities.

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `extracts`| `boolean` | A boolean flag indicating whether to include extracts highlights. |
| `entities`| `boolean` | A boolean flag indicating whether to include entities highlights. |

**Usage Example:**

```typescript
this.previewService.toggle(true, false);
```

### getAuditPreviewDetail()

Generates the audit details for a preview.

| Parameter            | Type             | Description                                                                 |
|----------------------|------------------|-----------------------------------------------------------------------------|
| `id`| `string` | The ID of the document. |
| `q`| `Partial<Query>` | The current search query. |

**Usage Example:**

```typescript
const detail = this.getAuditPreviewDetail(id, query);
const auditEvent = {
  type: 'Some type',
  detail
};
Audit.notify(auditEvent);
```

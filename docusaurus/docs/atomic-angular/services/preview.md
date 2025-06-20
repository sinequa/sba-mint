---
title: Preview Service
sidebar_class_name: update
description: Documentation for the Preview Service, which handles document previews, highlights, and interactions with the preview iframe.
---

The `PreviewService` is responsible for handling the preview of documents, including fetching and displaying highlighted extracts and entities.

### preview

Previews the data for a given ID and query.

```typescript
preview(
  id: string, 
  q: Partial<Query>, 
  customHighlights?: CustomHighlights[], 
  audit?: AuditEvents
): Observable<PreviewData>
```

| Parameter         | Type                | Description                                      |
|-------------------|---------------------|--------------------------------------------------|
| `id`              | `string`            | The ID to preview.                               |
| `query`           | `Partial<Query>`    | The query parameters for the preview.            |
| `customHighlights`| `CustomHighlights[]`| (Optional) Custom highlights for the preview.    |
| `audit`           | `AuditEvents`       | (Optional) The audit events to log.              |

**Returns:**

`Observable<PreviewData>` - An observable that emits the preview data.

#### Usage

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  previewDocument() {
    // Assuming 'documentId' is the ID of the document to preview
    this.previewService.preview('documentId', { text: 'query' }).subscribe(data => {
      console.log('Preview data:', data);
    });
  }
}
```

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  previewDocument() {
    const customHighlights: CustomHighlights[] = [
      { id: 'highlight1', text: 'Custom highlight text', category: 'category1' },
      // Add more custom highlights as needed
    ];
    // Assuming 'documentId' is the ID of the document to preview
    this.previewService.preview('documentId', { text: 'query' }, customHighlights).subscribe(data => {
      console.log('Preview data:', data);
    });
  }
}
```

### close

Closes the preview with the specified ID and updates the audit log.

```typescript
close(id: string, query: Partial<Query>): void
```

| Parameter | Type             | Description                                      |
|-----------|------------------|--------------------------------------------------|
| `id`      | `string`         | The ID of the preview to close.                  |
| `query`   | `Partial<Query>` | The partial query object used to retrieve the preview detail. |

#### Usage

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  closePreview() {
    // Assuming 'documentId' is the ID of the document to close
    this.previewService.close('documentId', { text: 'query' });
  }
}
```

### openExternal

Previews an article in a new browser's tab.

```typescript
openExternal(article: Article): void
```

| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| `article` | `Article`| The article to preview.  |

#### Usage
  
```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  openArticlePreview(article: Article) {
    // Assuming 'article' is an instance of Article
    this.previewService.openExternal(article);
  }
}
```

### setIframe

Sets the iframe window object.

```typescript
setIframe(iframe: Window | null): void
```

| Parameter | Type       | Description                                      |
|-----------|------------|--------------------------------------------------|
| `iframe`  | `Window \| null` | The window object of the iframe or null to unset. |

#### Usage
  
```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  setIframeWindow() {
    // Assuming you have a reference to the iframe window
    const iframeWindow: Window = document.getElementById('myIframe')?.contentWindow;
    this.previewService.setIframe(iframeWindow);
  }
}
```

### setPreviewData

Sets the preview data and updates the highlight category based on the provided data.

```typescript
setPreviewData(data: PreviewData): void
```

| Parameter | Type         | Description                                      |
|-----------|--------------|--------------------------------------------------|
| `data`    | `PreviewData`| The preview data to be set.                      |

#### Usage

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  setPreview() {
    const previewData: PreviewData = { /* ... */ }; // Your preview data here
    this.previewService.setPreviewData(previewData);
  }
}
```

### sendMessage

Sends a message to the iframe if it exists.

```typescript
sendMessage(message: unknown): void
```

| Parameter | Type  | Description                                      |
|-----------|-------|--------------------------------------------------|
| `message` | `unknown` | The message to be sent. It can be of any type. |

#### Usage

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  sendMessageToPreview() {
    this.previewService.sendMessage({ type: 'message', data: { /* your data */ } });
  }

  initPreview() {
    this.previewService.sendMessage({ action: 'init' });
  }
}
```

### retrieveHtmlContent

Send a message to the preview iFrame with the required data to retrieve HTML content for a specific highlight category.

```typescript
retrieveHtmlContent(id: string, highlightCategory: string, previewData: PreviewData): void
```

| Parameter          | Type          | Description                                      |
|--------------------|---------------|--------------------------------------------------|
| `id`               | `string`      | The unique identifier for the request.           |
| `highlightCategory`| `string`      | The category of highlights to retrieve.          |
| `previewData`      | `PreviewData` | The data containing highlights and their locations. |

#### Usage

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  getHtmlContent() {
    const previewData: PreviewData = { /* ... */ }; // Your preview data here
    this.previewService.retrieveHtmlContent('documentId', 'highlightCategory', previewData);
  }
}
```

### zoomIn

Sends a message to zoom in.

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  zoomInPreview() {
    this.previewService.zoomIn();
  }
}
```

### zoomOut

Sends a message to zoom out the preview.

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  zoomOutPreview() {
    this.previewService.zoomOut();
  }
}
```

### toggle AI description

Toggles the AI description in the preview.

```typescript
toggleAiDescription(enabled: boolean): void;
```

| Parameter | Type    | Description                                      |
|-----------|---------|--------------------------------------------------|
| `enabled` | `boolean` | A boolean flag indicating whether to enable or disable the AI description. |

#### Usage

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  toggleDescription() {
    this.previewService.toggleAiDescription(false); // Disable AI description
  }
}
```

### toggle

Toggles the highlights based on the provided flags for extracts and entities.

```typescript
toggle(extracts: boolean, entities: boolean): void
```

| Parameter | Type    | Description                                      |
|-----------|---------|--------------------------------------------------|
| `extracts`| `boolean` | A boolean flag indicating whether to include extracts highlights. |
| `entities`| `boolean` | A boolean flag indicating whether to include entities highlights. |

#### Usage

```typescript
export class MyComponent {
  previewService: PreviewService = ...; // Assume this is injected or instantiated

  toggleHighlights() {
    const entities = true; // or false
    const extracts = false; // or true
    this.previewService.toggle(extracts, entities);
  }
}
```

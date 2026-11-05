---
title: Metadata
---

The `Metadata` component offers several options for displaying dynamic information in your Angular applications.

## API Reference

### Properties

| Property  | Type | Description |
|---|---|---|
| `article` | `Article` | The article object containing metadata. |
| `metadata`| `string`   | The key of the metadata to display from the article object. |
| `limit` | `string \| number \| undefined` | The maximum number of metadata items to display. By default, all items are shown. |

## Usage

```ts title="sample.component.ts"
import { MetadataComponent } from "@sinequa/atomic-angular";

@Component({
    selector: "sample-component",
    imports: [MetadataComponent],
    template: `
    <metadata variant="outline" [article]="article" metadata="author" limit=3 />
    `,
}) export class SampleComponent {

    article = { 
        title: "Article Title",
        description: "Article Description",
        author: ["Author 1", "Author 2", "Author 3", "Author 4", "Author 5"],
    }
}
```

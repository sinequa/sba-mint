---
title: Source
sidebar_class_name: update
---

The `SourceComponent` displays an icon representing the source or collection of a document. It resolves the appropriate font icon or image from the application's source configuration (`AppStore.sources`).

## Usage

```typescript title="sample.component.ts"
import { SourceComponent } from '@sinequa/atomic-angular';

@Component({
  selector: 'sample',
  imports: [SourceComponent],
  template: `<source [collection]="['collection/myCollection']" [connector]="'myConnector'" />`,
})
export class SampleComponent {}
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `collection` | `string[]` | | Array of collection path strings (e.g. `["collection/myCollection"]`). |
| `connector` | `string` | | Connector name string. |

:::note
At least one of `collection` or `connector` should be provided. The component tries to resolve the icon for the collection first, then the source, then the connector.
:::

## Customization

Override icons via the `sources` customization JSON in the Sinequa administration:

```json
{
  "collection": {
    "Documents/Set1": { "iconClass": "fa-kit fa-sharepoint" }
  },
  "source": {
    "Sharepoint": { "iconClass": "fa-kit fa-sharepoint" }
  },
  "connector": {
    "crawler": { "iconPath": "your/image/path.png" }
  }
}
```

If `iconPath` is defined, an `<img>` is displayed; otherwise the `iconClass` is applied to an `<i>` element.

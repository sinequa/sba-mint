---
title: SourceIcon
sidebar_class_name: deprecated
---

The SourceIconPipe transforms a collection of strings into a corresponding icon class based on the source name. If the collection is empty or undefined, it returns a default icon class.

:::warning
**Caution:** This pipe is deprecated and will be removed in the future.
:::

### API

```typescript
transform(collection: string[]): string
```

| Parameter   | Type       | Description                                 |
|-------------|------------|---------------------------------------------|
| `collection`| `string[]` | An array of strings representing the collection. |

#### Returns

`string` - A string representing the icon class.

### Usage

```typescript
import { SourceIconPipe } from '@sinequa/atomic-angular';
import { FAIcon } from '@sinequa/ui';

@Component({
  selector: 'document-icon',
  imports: [FAIcon, SourceIconPipe],
  template: `
    <FaIcon [faClass]="source | sourceIcon"></i>
  `
})
export class DocumentIconComponent {
  source = ['web/example'];
}
```

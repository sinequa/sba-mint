---
title: FileSize
sidebar_class_name: new
---

The `FileSizePipe` converts a raw byte count into a human-readable size object with a localization key and a numeric value (e.g. `{ key: 'fileSize.MB', value: 2.5 }`).

## API

```typescript
transform(value: number): { key: string; value: number }
```

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `value` | `number` | ✓ | File size in bytes. |

**Returns** `{ key: string; value: number }` — an object where `key` is a translation key (e.g. `'fileSize.KB'`, `'fileSize.MB'`) and `value` is the converted numeric size.

## Usage

```typescript title="example.component.ts"
import { FileSizePipe } from '@sinequa/atomic-angular';

@Component({
  imports: [FileSizePipe],
  template: `<span>{{ bytes | fileSize | json }}</span>`,
})
export class ExampleComponent {
  bytes = 1048576; // 1 MB
}
```

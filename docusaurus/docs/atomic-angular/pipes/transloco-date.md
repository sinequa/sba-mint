---
title: TranslocoDate
---

## Overview

The `TranslocoDateImpurePipe` is an extension of Angular's `DatePipe` that updates automatically when the language changes using Transloco. This pipe provides reactive date formatting that respects the current language.

### API

```typescript
transform(value: Date | string | number, format?: string, timezone?: string): string | null
```

| Parameter   | Type                          | Description                                             |
|-------------|-------------------------------|---------------------------------------------------------|
| `value`     | `Date \| string \| number`    | The date to be formatted                                |
| `format`    | `string`                      | Optional. The date format pattern                       |
| `timezone`  | `string`                      | Optional. The timezone to use for formatting            |

#### Returns

`string | null` - The formatted date string, or null if the date is invalid.

### Usage

```typescript
import { TranslocoDateImpurePipe } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-document-date',
  imports: [TranslocoDateImpurePipe],
  template: `
    <span>{{ documentDate | translocoDate:'medium' }}</span>
  `
})
export class DocumentDateComponent {
  documentDate = new Date();
}
```

### Notes

This pipe is impure, which means it will be executed during every change detection cycle. It listens to Transloco language changes and updates the formatted date when the language changes.

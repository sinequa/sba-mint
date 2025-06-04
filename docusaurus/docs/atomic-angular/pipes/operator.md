---
title: Operator
---

## Overview

The `OperatorPipe` transforms filter operators into their HTML entity representations for display in the UI. It handles various comparison operators and special cases like 'between' and 'and'.

### API

```typescript
transform(filter?: LegacyFilter): string
```

| Parameter   | Type             | Description                                                    |
|-------------|------------------|----------------------------------------------------------------|
| `filter`    | `LegacyFilter`   | Optional. The filter object containing an operator and value   |

#### Returns

`string` - A string representation of the operator with the filter value.

### Operator Transformations

| Operator     | HTML Entity | Display   |
|--------------|-------------|-----------|
| `lt`         | `&lt;`      | \<         |
| `lte`        | `&le;`      | ≤         |
| `eq`         | `=`         | =         |
| `neq`        | `&ne;`      | ≠         |
| `gte`        | `&ge;`      | ≥         |
| `gt`         | `&gt;`      | \>         |
| `between`    | Special case | \> start ≤ end |
| `and`        | Special case | Uses display or value |

### Usage

```typescript
import { OperatorPipe } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-filter-display',
  standalone: true,
  imports: [OperatorPipe],
  template: `
    <span [innerHTML]="filter | operator"></span>
  `
})
export class FilterDisplayComponent {
  filter = { 
    operator: 'gte', 
    value: '100' 
  };
  
  // Will display as "≥ 100"
  
  betweenFilter = { 
    operator: 'between', 
    start: '10', 
    end: '20' 
  };
  
  // Will display as "> 10 ≤ 20"
}
```

### Notes

The output of this pipe contains HTML entities, so it should be used with the `[innerHTML]` binding in Angular templates to render properly.

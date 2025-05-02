---
title: Operator
---

## Overview
This pipe is used to transform a filter into its string operation.

### API

```typescript
transform(filter?: LegacyFilter): string
```

This pipe takes in a `filter` LegacyFilter.
It returns the string of its corresponding operation.


### Usage


```ts
@Component({
  /** component details */
  providers: [OperatorPipe],
}){
  operatorPipe = inject(OperatorPipe);
  
  filter = signal<LegacyFilter>({});

  transformedFilter = computed(() => this.operatorPipe.transform(this.filter()));
}
```
---
title: Transloco Date
---

## Overview
The `TranslocoDateImpurePipe` class is a custom pipe extending `DatePipe` to also use `TranslocoService` for the display of dates.

### API

```typescript
override transform(value: Date | string | number, format?: string, timezone?: string): string | null
```

```typescript
override transform(value: null | undefined, format?: string, timezone?: string): null
```

```typescript
override transform(value: Date | string | number | null | undefined, format?: string, timezone?: string): string | null
```

This pipe takes in a `value` which can be of types Date, string, number, null or undefined, and some optional strings `format` and `timezone`.
It returns the formatted string.


### Usage


```html
{{ article().modified | translocoDate: 'mediumDate' }}
```
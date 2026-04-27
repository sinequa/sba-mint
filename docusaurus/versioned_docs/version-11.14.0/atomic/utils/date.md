---
title: Date Utilities
---

This module provides utility functions for comparing dates and generating localized relative time strings such as "in 2 days" or "4 days ago". It uses the browser's `Intl.RelativeTimeFormat` API.

## Types

### `RelativeDate`

Represents the computed difference between two dates.

```typescript
type RelativeDate = {
  offset: number;
  unit: Intl.RelativeTimeFormatUnit;
  isFuture: boolean;
};
```

| Property | Type | Description |
|----------|------|-------------|
| `offset` | `number` | Absolute difference in days between the two dates |
| `unit` | `Intl.RelativeTimeFormatUnit` | Always `'day'` in the current implementation |
| `isFuture` | `boolean` | `true` if the target date is in the future |

## Functions

### `getRelativeDate()`

Returns a localized, human-readable relative date string.

```typescript
function getRelativeDate(locale: string, target: string, base?: string): string
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `locale` | `string` | ✓ | BCP 47 locale code (e.g. `'en-US'`, `'fr-FR'`) |
| `target` | `string` | ✓ | Target date as an ISO string |
| `base` | `string` | | Base date to compare against. Default: current date |

**Returns** `string` — localized relative time string (e.g. `"in 2 days"`, `"4 days ago"`).

**Example**

```typescript title="get-relative-date.ts"
import { getRelativeDate } from '@sinequa/atomic';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 2);
getRelativeDate('en-US', futureDate.toISOString()); // 'in 2 days'

getRelativeDate('en-US', '2025-04-25T10:00:00Z', '2025-04-29T10:00:00Z'); // '4 days ago'
getRelativeDate('fr-FR', '2025-04-25T10:00:00Z', '2025-04-29T10:00:00Z'); // 'il y a 4 jours'
```

---

### `getOffsetFromDates()`

Calculates the date difference and returns a structured `RelativeDate` object.

```typescript
function getOffsetFromDates(target: string, base?: string): RelativeDate
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `target` | `string` | ✓ | Target date as an ISO string |
| `base` | `string` | | Base date to compare against. Default: current date |

**Returns** `RelativeDate`

**Example**

```typescript title="get-offset-from-dates.ts"
import { getOffsetFromDates } from '@sinequa/atomic';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
getOffsetFromDates(tomorrow.toISOString());
// { offset: 1, unit: 'day', isFuture: true }

getOffsetFromDates('2025-04-15T10:00:00Z', '2025-04-29T10:00:00Z');
// { offset: 14, unit: 'day', isFuture: false }
```

:::note Limitations
The current implementation always returns differences in **days**, regardless of the actual time span. The `unit` property is always `'day'`.
:::

---
title: Date Utilities Module
---

## Introduction

This module provides utility functions for working with dates in a standardized way. It focuses on comparing dates and generating human-readable relative time strings (such as "in 3 days", "4 days ago", etc.). The utilities use the `Intl.RelativeTimeFormat` API to provide localized date representations.

## Types

### RelativeDate

The module defines a `RelativeDate` type that represents the difference between two dates:

```typescript
export type RelativeDate = {
  offset: number;
  unit: Intl.RelativeTimeFormatUnit;
  isFuture: boolean;
};
```

| Property   | Type                        | Description                                             |
|------------|-----------------------------|---------------------------------------------------------|
| `offset`   | `number`                    | The absolute difference in days between two dates        |
| `unit`     | `Intl.RelativeTimeFormatUnit`| The unit of time used for the difference (always `'day'` in current implementation) |
| `isFuture` | `boolean`                   | Indicates if the target date is in the future           |

## Functions

### getRelativeDate

Generates a human-readable string representing the relative time between two dates using the browser's `Intl.RelativeTimeFormat` API.

```typescript
function getRelativeDate(locale: string, target: string, base?: string): string
```

#### Parameters

| Parameter | Type     | Required | Description                                           |
|-----------|----------|----------|-------------------------------------------------------|
| `locale`  | `string` | Yes      | Locale to use for formatting the relative date string |
| `target`  | `string` | Yes      | Target date to compare (ISO date string)              |
| `base`    | `string` | No       | Base date to compare against (defaults to current date)|

#### Returns

A localized, human-readable string representing the relative time between the dates (e.g., "in 2 days", "4 days ago").

#### Example

```typescript
import { getRelativeDate } from '@sinequa/atomic';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 2);
const relativeFuture = getRelativeDate('en-US', futureDate.toISOString());
// Result: "in 2 days"

const pastDate = '2025-04-25T10:00:00.000Z';
const baseDate = '2025-04-29T10:00:00.000Z';
const relativePast = getRelativeDate('en-US', pastDate, baseDate);
// Result: "4 days ago"

const frenchRelative = getRelativeDate('fr-FR', pastDate, baseDate);
// Result: "il y a 4 jours"
```

### getOffsetFromDates

Calculates the difference between two dates and returns a structured `RelativeDate` object. The difference is always in days.

```typescript
function getOffsetFromDates(target: string, base?: string): RelativeDate
```

#### Parameters

| Parameter | Type     | Required | Description                                           |
|-----------|----------|----------|-------------------------------------------------------|
| `target`  | `string` | Yes      | Target date to compare (ISO date string)              |
| `base`    | `string` | No       | Base date to compare against (defaults to current date)|

#### Returns

A `RelativeDate` object containing:

- `offset`: The absolute difference between dates in days
- `unit`: Always `'day'`
- `isFuture`: Boolean indicating if the target date is in the future

#### Example

```typescript
import { getOffsetFromDates } from '@sinequa/atomic';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowOffset = getOffsetFromDates(tomorrow.toISOString());
// Result: { offset: 1, unit: 'day', isFuture: true }

const firstDate = '2025-04-15T10:00:00.000Z';
const secondDate = '2025-04-29T10:00:00.000Z';
const dateComparison = getOffsetFromDates(firstDate, secondDate);
// Result: { offset: 14, unit: 'day', isFuture: false }
```

## Limitations

- The `getOffsetFromDates` function currently only returns differences in days, regardless of the actual time span between dates.
- Both functions expect ISO date strings or date strings that can be parsed by the JavaScript `Date` constructor.
- The `unit` property is always `'day'` in the current implementation.

## Future Enhancements

Potential improvements for this module could include:

- Supporting different time units (hours, minutes, weeks, months, years) based on the magnitude of the time difference
- Adding options to customize the formatting of relative dates
- Providing additional date comparison and formatting utilities

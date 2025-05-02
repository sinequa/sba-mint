---
title: SponsoredResults
---

## Overview

The `SponsoredResults` component is an Angular component that displays sponsored links defined in the AppStore configuration.

### Properties

| Property           | Type                      | Description                                                          |
|--------------------|---------------------------|----------------------------------------------------------------------|
| `sponsoredLinks`   | `Signal<string>`          | Identifier or configuration for sponsored links from the AppStore.   |
| `sponsoredResults` | `Signal<LinkResult[]>`    | The list of processed sponsored link results.                        |

## Examples

The `SponsoredResultsComponent` can be used in the template of a parent component as follows:

```html
<sponsored-results />
```

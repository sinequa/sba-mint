---
title: MissingTerms
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview

The `MissingTerms` component is an Angular component that displays missing search terms related to an `Article` object.

### Properties

| Property       | Type                                                                 | Description                                                 |
|----------------|----------------------------------------------------------------------|-------------------------------------------------------------|
| `article`      | `Input<Article>`                                                     | The `Article` object for which to display missing terms.    |
| `missingTerms` | `Signal<{value: string; queryParams: {q: string}}[]>` | A list of missing terms related to the article. Each item includes the term's display value and the query parameters to apply to the current search if the term is clicked. |

## Examples

The `MissingTerms` component has no special further customization and can therefore simply be used in the template of a parent component as follows:

```html
<missing-terms [article]="article()" />
```

---
title: OpenArticleOnCtrlEnter
---

## Overview

Directive that opens an article in the preview when pressing Ctrl + Enter.

### Usage

```html
<div [article]="myArticle" openArticleOnCtrlEnter></div>
```

- Requires an `article` input (of type `Article`)
- Triggers the preview service to open the article externally when Ctrl+Enter is pressed while the element is focused.

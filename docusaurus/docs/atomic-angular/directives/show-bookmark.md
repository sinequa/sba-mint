---
title: ShowBookmark
---

## Overview
Directive that handles the behavior of showing a bookmark for an article.

:::info
This directive listens to mouse enter and mouse leave events to determine when to show the bookmark.
It also checks the user's settings to determine if the article is bookmarked.
:::

### Usage
```html
// $event is a boolean value
<div showBookmark [article]="currentArticle" (showBookmark)="onShowBookmark($event)"></div>
```
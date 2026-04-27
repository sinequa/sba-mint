---
title: SelectArticle
sidebar_class_name: new
---

The `SelectArticleDirective` selects an article when the host element is clicked, using a configurable selection strategy. It supersedes the deprecated `SelectArticleOnClickDirective`.

## Usage

```html
<div [article]="myArticle" [strategy]="'stack'" selectArticle></div>
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `article` | `Article` | ✓ | The article to select on click. |
| `strategy` | `SelectionStrategy` | | How to handle the selection. Default: `'replace'`. |
| `redirectUrl` | `string` | | The URL to navigate to when `strategy` is `'redirect'`. Default: `'/preview'`. |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `selected` | `EventEmitter<Article>` | Emitted when the article is selected (strategy `'emit'`). |

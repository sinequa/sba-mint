---
title: OpenArticleOnCtrlEnter
sidebar_class_name: update
---

The `OpenArticleOnCtrlEnterDirective` opens an article in the preview when the user presses **Ctrl+Enter** while the host element is focused.

## Usage

```html
<div [article]="myArticle" openArticleOnCtrlEnter></div>
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `article` | `Article` | ✓ | The article to open in the preview on Ctrl+Enter. |

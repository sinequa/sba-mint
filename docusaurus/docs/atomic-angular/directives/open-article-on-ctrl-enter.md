---
title: OpenArticleOnCtrlEnter
---

## Overview
Directive that opens an article in a new tab upon hitting `Ctrl + Enter` on it.

### Usage
#### Using host directives attribute
```ts title="some-component.ts"
@Component({
  ...
  standalone: true,
  imports: [ OpenArticleOnCtrlEnterDirective ],
  hostDirectives: [
    {
      directive: OpenArticleOnCtrlEnterDirective,
      inputs: ['article']
    }
  ]
})
export class SomeComponent { 
  article = {};
}
```

#### Directly in the HTML template
```html
<div openArticleOnCtrlEnter [article]="{}">
```

---
title: SelectArticleOnClick
---

## Overview
Directive that selects an article on click to be displayed into the stack panel using a open's specific strategy: __'stack'__ or __'replace'__.  

:::info
Default open's strategy is 'stack'
:::

### Usage
#### Using host directives attribute
```ts title="some-component.ts"
@Component({
  ...
  standalone: true,
  imports: [ SelectArticleOnClickDirective ],
  hostDirectives: [
    {
      directive: SelectArticleOnClickDirective,
      inputs: ['article', 'strategy']
    }
  ]
})
export class SomeComponent { 
  article = {};
  strategy: SelectionStrategy = "replace";
}
```
#### Directly in the HTML template
```html
<div selectArticleOnClick [article]="{}" strategy="stack" }>
```

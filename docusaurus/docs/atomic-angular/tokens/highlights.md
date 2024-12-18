---
title: Highlights
---

## Overview

Allow you to customize the preview's highlights.


### PreviewHighlightName 

`PreviewHighlightName` type is a TypeScript union type that restricts the possible values to a set of predefined strings: 'company', 'geo', 'person', 'extractslocations', and 'matchlocations'. This ensures that any variable of this type can only hold one of these specific string values.

### PreviewHighlight

`PreviewHighlight` type is an object type that describes the shape of a highlight object. It has three properties: name, which must be one of the PreviewHighlightName values; color, which is a string representing the text color; and bgColor, which is a string representing the background color.

### HIGHLIGHTS

`HIGHLIGHTS` constant is an instance of InjectionToken that is configured to provide an array of `PreviewHighlight` objects. The InjectionToken constructor takes two arguments: a description string ('highlights') and an options object. The options object includes a factory function that returns an array of pre-configured highlight objects. Each object in this array has a name, color, and bgColor property, corresponding to the PreviewHighlight type.

This setup allows the `HIGHLIGHTS` token to be used for dependency injection throughout the Angular application. By injecting this token, components and services can access the predefined highlight configurations, promoting consistency and reusability across the application.

<details open>
  <summary>pre configured highlights's colors</summary>
```ts
// pre-configured highlights's colors
export const HIGHLIGHTS = new InjectionToken<PreviewHighlight[]>('highlights', {
  factory: () => [
    {
      name: 'company',
      color: 'white',
      bgColor: '#FF7675'
    },
    {
      name: 'geo',
      color: 'white',
      bgColor: '#74B9FF'
    },
    {
      name: 'person',
      color: 'white',
      bgColor: '#00ABB5'
    },
    {
      name: 'extractslocations',
      color: 'black',
      bgColor: '#fffacd'
    },
    {
      name: 'matchlocations',
      color: 'black',
      bgColor: '#ff0'
    }
  ],
});
```
</details>
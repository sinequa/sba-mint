---
title: ChildMarker
sidebar_class_name: new
---

The `ChildMarkerDirective` marks a child element so that a parent component can discover and render it dynamically via its `TemplateRef`. It exposes the template publicly for structural composition patterns.

## Usage

```html
<ng-template childMarker>
  <span>Dynamic content</span>
</ng-template>
```

## API Reference

### Properties

| Name | Type | Description |
|------|------|-------------|
| `template` | `TemplateRef<unknown>` | The template ref of the marked child element, injected and exposed for the parent to consume. |

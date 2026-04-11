---
title: ThemeSelector
sidebar_class_name: update
---

The `ThemeSelectorComponent` displays a list of available themes and lets users switch between them for a given scope.

## Usage

```typescript title="sample.component.ts"
import { ThemeSelectorComponent } from '@sinequa/atomic-angular';

@Component({
  selector: 'sample',
  imports: [ThemeSelectorComponent],
  template: `<theme-selector [scope]="scope" />`,
})
export class SampleComponent {
  scope = 'main';
}
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `scope` | `string` | ✓ | The application scope identifier used for theme management. |
| `showPrivate` | `boolean` | | Whether to display themes marked as private. |

### Two-way bindings

| Name | Type | Description |
|------|------|-------------|
| `selectedTheme` | `model<string>` | The name of the currently selected theme. |

### Methods

#### `selectTheme()`

Switches the active theme for the configured scope.

```typescript
selectTheme(themeName: string): void
```

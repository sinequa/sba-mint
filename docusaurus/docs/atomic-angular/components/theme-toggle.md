---
title: ThemeToggle
---

The `ThemeToggleComponent` provides a toggle button for switching between light and dark mode for a given scope.

## Usage

```typescript title="sample.component.ts"
import { ThemeToggleComponent } from '@sinequa/atomic-angular';

@Component({
  selector: 'sample',
  imports: [ThemeToggleComponent],
  template: `<theme-toggle [scope]="scope" />`,
})
export class SampleComponent {
  scope = 'main';
}
```

## API Reference

### Inputs

| Name | Type | Required | Description |
|------|------|:--------:|-------------|
| `scope` | `string` | ✓ | The application scope identifier. |

### Two-way bindings

| Name | Type | Description |
|------|------|-------------|
| `darkMode` | `model<boolean>` | Whether dark mode is currently enabled. |

### Methods

#### `toggleDarkMode()`

Toggles between dark and light mode for the configured scope.

```typescript
toggleDarkMode(): void
```

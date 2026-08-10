---
title: Tailwindcss
---

## cn()

The `cn` function handles the proper merging of CSS classes to have cleaner CSS properties.

### Parameters

| Parameter     | Type          | Description                                                   |
|---------------|---------------|---------------------------------------------------------------|
| `inputs`   | `ClassValue[]`      | All of the classes to merge together .          |

#### Returns

| Type        | Description                                                   |
|-------------|---------------------------------------------------------------|
| `string` | The merged classes. |

### Usage

```ts
import { cn } from '@sinequa/ui';

@Component({
  ...
  template: `
    <div [class]="cn('w-full h-full', someCondition() && 'w-1/2')">
      <!-- it will be "w-1/2 h-full" if someCondition() is true, otherwise "w-full h-full" -->
    </div>
  `
})
export class SomeComponent {
  cn = cn;

  someCondition = signal<boolean>(false);
}
```

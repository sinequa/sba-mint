---
title: Syslang
---

## Overview

The `SyslangPipe` is a custom pipe that transforms a string value using the current language. This pipe is used to translate strings that are not part of the Angular i18n system. It exists to maintain compatibility with a legacy system that uses a custom language syntax.

### API

```typescript
transform(value?: string, lang?: string): string | null
```

| Parameter   | Type       | Description                                                    |
|-------------|------------|----------------------------------------------------------------|
| `value`     | `string`   | Optional. The input string value to be transformed             |
| `lang`      | `string`   | Optional. The language code to use for translation. If not provided, the active language from Transloco is used |

#### Returns

`string | null` - The transformed string value based on the specified or active language.

### Usage

```typescript
import { SyslangPipe } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-multilingual-text',
  imports: [SyslangPipe],
  template: `
    <!-- Using active language -->
    <div>{{ 'Hello[fr]Bonjour' | syslang }}</div>
    
    <!-- Forcing French language -->
    <div>{{ 'Hello[fr]Bonjour' | syslang:'fr' }}</div>
  `
})
export class MultilingualTextComponent {}
```

### Notes

This pipe is impure, which means it will be executed during every change detection cycle. It listens to Transloco language changes and updates the translation when the language changes.

The input string should follow a specific format:

- `'Hello[fr]Bonjour'` will display "Bonjour" if the language is 'fr', otherwise it will display "Hello".
- You can include multiple language variants in one string: `'Hello[fr]Bonjour[de]Hallo[es]Hola'`

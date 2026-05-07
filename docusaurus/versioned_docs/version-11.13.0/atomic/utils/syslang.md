---
title: sysLang
---

This utility provides a function to extract and translate system language-formatted text to a specified locale.
It is useful for handling multilingual strings where different translations are embedded in a single string.

:::caution
This utility exists for compatibility with legacy systems and is not recommended for new applications.
:::

### sysLang()

Translates a system language formatted text to the specified locale. If a matching language is found,
returns the translated text; otherwise, returns the default language text.

```typescript
function sysLang(text: string, currentLocale: string): string
```

#### Parameters

| Parameter       | Type     | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `text`          | `string` | The system language formatted text to translate   |
| `currentLocale` | `string` | The locale to translate the text to (e.g., 'fr-FR', 'en-US') |

#### Returns

| Type      | Description                                 |
|-----------|---------------------------------------------|
| `string`  | The translated text or the default language text |

#### Example

```typescript
import { sysLang } from '@sinequa/atomic';

sysLang('all[fr]tous[de]alle', 'en-US'); // "all"
sysLang('all[fr]tous[de]alle', 'fr-FR'); // "tous"
sysLang('all[fr]tous[de]alle', 'fr');    // "tous"
```

## Notes

- The input string should be formatted as `default[fr]french[de]german`, etc.
- If no matching language is found, the default language text is returned.

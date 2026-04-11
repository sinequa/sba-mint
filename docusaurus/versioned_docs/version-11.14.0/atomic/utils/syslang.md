---
title: sysLang
sidebar_class_name: update
---

Extracts and returns the translation for a given locale from a system language-formatted string. If no matching locale is found, the default (first) value is returned.

:::caution
This utility exists for backward compatibility with legacy Sinequa system language strings. It is not recommended for new applications — use a standard i18n library instead.
:::

```typescript
function sysLang(text: string, currentLocale: string): string
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `text` | `string` | ✓ | System language formatted string (e.g. `'all[fr]tous[de]alle'`) |
| `currentLocale` | `string` | ✓ | BCP 47 locale code to resolve (e.g. `'fr-FR'`, `'en-US'`) |

**Returns** `string` — the translated text, or the default (first) value if no match is found.

**Example**

```typescript title="syslang.ts"
import { sysLang } from '@sinequa/atomic';

sysLang('all[fr]tous[de]alle', 'en-US'); // 'all'
sysLang('all[fr]tous[de]alle', 'fr-FR'); // 'tous'
sysLang('all[fr]tous[de]alle', 'fr');    // 'tous'
sysLang('all[fr]tous[de]alle', 'de-DE'); // 'alle'
```

:::note
Input format: `default[locale1]translation1[locale2]translation2...`
:::

---
title: Syslang
---

## Overview
The `SyslangPipe` class is a custom pipe that transforms a string value using the current language.

This pipe is used to translate strings that are not part of the Angular i18n system.

This pipe exists to keep the compatibility with a legacy system that uses a custom language syntax.

### API

```typescript
transform(value?: string, lang?: string): string | null
```

This pipe takes in a `value` string and a `lang` string.
It returns the translated string.


### Usage


```html
<div>{{ 'Hello[fr]Bonjour' | syslang }}</div>
<!-- output: `Bonjour` if your current language is 'fr' -->
<!-- output: `Hello` if your current language is not 'fr' -->

<div>{{ 'Hello[fr]Bonjour' | syslang: 'fr' }}</div>
<!-- output: `Bonjour` even if your current language is not 'fr' -->
```
---
title: HighlightWord
---

The HighlightWordPipe is used to highlight a specific word within a given text. It normalizes both the input text and search word to handle accented characters.

### API

```typescript
transform(value: string, word: string, clipBy?: number): HighlightWords.Chunk[]
```

This pipe takes in a `value` string, a `word` string to highlight, and an optional `clipBy` number to limit the length of the highlighted text.
It returns an array of `HighlightWords.Chunk` objects representing the highlighted portions of the text.

### Third-party

We are using the [highligh-words](https://github.com/tricinel/highlight-words#readme) library to highlight words.

> _Give it a piece of text and a search query, and it splits it into chunks separating matches from non-matches, allowing you to highlight the matches, visually or otherwise, in your app._

:::note
We have integrated this library into an Angular's Pipe to ease its usage within Angular Templates.
:::

### Accent Handling

The pipe normalizes both the input text and search query to handle accented characters properly. This means searching for "resume" will match both "resume" and "résumé" in the text.

### Usage

```ts title="autocomplete.component.ts"
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { HighlightWordPipe } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-autocomplete',
  imports: [NgClass, HighlightWordPipe],
  template: `
@for(chunk of message | highlightWord:text:10; track $index ) {
  <span [ngClass]="{ 'font-bold': chunk.match }">{{ chunk.text }}</span>
}  
  `,
  styles: `
    .font-bold {
      font-weight: 700;
    }
  `
})
export class AutocompleteComponent {
  message = "Nikola Tesla (/ˈtɛslə/; Serbian Cyrillic: Никола Тесла;[2] pronounced [nǐkola têsla];[a] 10 July 1856 – 7 January 1943) was a Serbian-American[4][5][6] inventor, electrical engineer,";
  text = "tesla";
}
```

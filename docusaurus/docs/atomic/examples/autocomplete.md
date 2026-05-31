---
title: Autocomplete & suggestions
sidebar_class_name: new
---

This recipe builds a debounced autocomplete box backed by [`fetchSuggest()`](../api/suggest.md). It also covers cancelling stale requests so the dropdown always reflects the latest keystroke.

## The API

`fetchSuggest(suggestQueryName, text, filter?, kinds?, showSource?)` returns `Promise<Suggestion[]>`.

```js title="suggest.js"
import { fetchSuggest } from '@sinequa/atomic';

// Basic
const suggestions = await fetchSuggest('_suggest', 'sineq');

// Restrict to certain kinds (e.g. only people)
const people = await fetchSuggest('_suggest', 'john', undefined, ['person']);

// With a column filter + multiple kinds
const filtered = await fetchSuggest('_suggest', 'report', { docformat: 'doc' }, ['city', 'name']);
```

A `Suggestion` typically carries `display` (the label), `category`/`kind`, and may carry the source column when `showSource` is `true`.

## Vanilla JS: debounced input

Debounce keystrokes and ignore responses that arrive out of order (a slow early request resolving after a faster later one).

```js title="autocomplete.js"
import { fetchSuggest } from '@sinequa/atomic';

export function attachAutocomplete(input, listEl, { queryName = '_suggest', delay = 200 } = {}) {
  let timer;
  let seq = 0; // monotonically increasing request id

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const text = input.value.trim();
    if (!text) {
      listEl.replaceChildren();
      return;
    }
    timer = setTimeout(async () => {
      const mine = ++seq;
      try {
        const suggestions = await fetchSuggest(queryName, text);
        if (mine !== seq) return; // a newer request superseded this one
        listEl.replaceChildren(
          ...suggestions.map((s) => {
            const li = document.createElement('li');
            li.textContent = s.display;
            return li;
          }),
        );
      } catch {
        if (mine === seq) listEl.replaceChildren();
      }
    }, delay);
  });
}
```

## React: a `useSuggestions` hook

The hook debounces the text and uses an incrementing ref to discard stale responses. Pass it the debounced value of your search box.

```jsx title="use-suggestions.jsx"
import { useEffect, useRef, useState } from 'react';
import { fetchSuggest } from '@sinequa/atomic';

export function useSuggestions(text, { queryName = '_suggest', delay = 200, kinds } = {}) {
  const [suggestions, setSuggestions] = useState([]);
  const seq = useRef(0);

  useEffect(() => {
    const query = text.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      const mine = ++seq.current;
      try {
        const results = await fetchSuggest(queryName, query, undefined, kinds);
        if (mine === seq.current) setSuggestions(results);
      } catch {
        if (mine === seq.current) setSuggestions([]);
      }
    }, delay);

    return () => clearTimeout(handle);
  }, [text, queryName, delay, kinds]);

  return suggestions;
}
```

```jsx title="SearchBox.jsx"
import { useState } from 'react';
import { useSuggestions } from './use-suggestions';

export function SearchBox({ onSelect }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const suggestions = useSuggestions(text);

  function choose(s) {
    setText(s.display);
    setOpen(false);
    onSelect?.(s);
  }

  return (
    <div className="combobox">
      <input
        value={text}
        onChange={(e) => { setText(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        role="combobox"
        aria-expanded={open}
        placeholder="Search…"
      />
      {open && suggestions.length > 0 && (
        <ul role="listbox">
          {suggestions.map((s, i) => (
            <li key={`${s.display}-${i}`} role="option" onMouseDown={() => choose(s)}>
              {s.display}
              {s.category && <small> · {s.category}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

:::tip Why `onMouseDown` instead of `onClick`?
`onMouseDown` fires before the input's `blur`, so the selection isn't lost if you also close the dropdown on blur.
:::

## See also

- [Suggest API](../api/suggest.md) — `fetchSuggest()`, `fetchSuggestField()` reference.
- [Search & pagination](./search-and-pagination.md) — run the actual search once a suggestion is picked.

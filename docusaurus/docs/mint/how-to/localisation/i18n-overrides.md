---
sidebar_class_name: new
---
# i18n Translation Overrides

## The idea in one sentence

The app loads translations from the library. The override system lets you **replace specific words** without touching the library files.

---

## How it works (step by step)

Think of it like a sticker book:

1. The library provides the **base sticker sheet** (original translations).
2. You place your **custom stickers on top** (override files).
3. Where you put a sticker, it hides what was underneath. Where you don't, the original shows through.

In code terms:

```
base translations  +  your overrides  =  final translations
{ label: "Bookmarks" }  +  { label: "Mes Bookmarks" }  =  { label: "Mes Bookmarks" }
```

---

## File structure

```
src/assets/i18n/
├── bookmarks/
│   ├── en.json          ← library base file (do NOT edit)
│   ├── fr.json
│   └── de.json
├── collections/
│   ├── en.json          ← library base file (do NOT edit)
│   ├── fr.json
│   └── de.json
└── overrides/           ← YOUR files go here
    ├── bookmarks/
    │   ├── en.json
    │   ├── fr.json
    │   └── de.json
    └── collections/
        ├── en.json
        ├── fr.json
        └── de.json
```

**Rule:** mirror the same folder/file structure under `overrides/`.

---

## How to override a translation

### 1. Find the key you want to change

Open the base file, e.g. `src/assets/i18n/bookmarks/en.json`:

```json
{
  "label": "Bookmarks",
  "myBookmarks": "My Bookmarks",
  "noBookmarks": "No bookmarks yet"
}
```

### 2. Create (or edit) the matching override file

Create `src/assets/i18n/overrides/bookmarks/en.json` and put **only the keys you want to change**:

```json
{
  "label": "My Saved Items"
}
```

You don't need to copy everything — only what you want to override.

### 3. The result at runtime

```json
{
  "label": "My Saved Items",    ← from your override
  "myBookmarks": "My Bookmarks", ← from the library (unchanged)
  "noBookmarks": "No bookmarks yet" ← from the library (unchanged)
}
```

---

## How to add a new scope to the override system

By default, the override system is disabled for all scopes.

To add a new scope (e.g. `savedSearches`):

**1.** Open src/config/transloco/transloco-loader-overrides.ts and add the scope name to the list:

```ts
const OVERRIDDEN_SCOPES = ["savedSearches"];
```

**2.** Create the override folder and files:

```
src/assets/i18n/overrides/savedSearches/en.json
src/assets/i18n/overrides/savedSearches/fr.json
src/assets/i18n/overrides/savedSearches/de.json
```

Even if they are empty (`{}`), the files must exist (an HTTP 404 is silently ignored, but it's cleaner to have them).

---

## How the pieces fit together

| File | Role |
|------|------|
| transloco-loader-overrides.ts | Custom loader — fetches base + override, merges them |
| transloco/transloco-providers.ts | Registers the loader in the Angular app |
| deepmerge.ts | Deep-merges the two JSON objects (nested keys work too) |
| `assets/i18n/<scope>/<lang>.json` | Base translations from the library |
| `assets/i18n/overrides/<scope>/<lang>.json` | **Your** custom overrides |

---

## Nested keys work too

Your override files support deep nesting. For example:

**Base:**

```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

**Override:**

```json
{
  "actions": {
    "save": "Keep it"
  }
}
```

**Result:**

```json
{
  "actions": {
    "save": "Keep it",   ← overridden
    "cancel": "Cancel"   ← kept from base
  }
}
```

---

## FAQ

**Q: What if my override file is missing or returns a 404?**  
A: No problem. The loader catches the error and treats it as an empty override `{}`. The base translations load normally.

**Q: Do I need to include all keys in my override file?**  
A: No — only the ones you want to change.

**Q: What if the same key appears in both files?**  
A: The override always wins.

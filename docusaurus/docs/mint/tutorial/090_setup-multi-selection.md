---
layout: default
title: Setup Multi-Selection Toolbar
parent: Tutorial
sidebar_position: 9
---

# Setup Multi-Selection Toolbar

In this chapter, you will learn how to add and configure the multi-selection toolbar.

The `MultiSelectionToolbarComponent` provides a contextual toolbar that appears at the bottom of the screen when a user selects multiple items.

As it uses the `SelectionStore`, you only need to add the toolbar component to your application and a way to select items in your result list.
The toolbar will automatically listen to the selection changes and update its state accordingly.

## Adding the toolbar

1. In your component's TypeScript file, import the `MultiSelectionToolbarComponent` from `@sinequa/atomic-angular`.

```ts
import { MultiSelectionToolbarComponent } from '@sinequa/atomic-angular';
```

2. Add the `MultiSelectionToolbarComponent` to the `imports` array of your component decorator.

```ts
@Component({
  ...
  imports: [
    ...,
    MultiSelectionToolbarComponent
  ],
  ...
})
```

3. In your component's HTML template, add the `<MultiSelectionToolbar>` tag.

```html
<MultiSelectionToolbar />
```

## Variants

The toolbar comes with three visual themes: `dark`, `light`, and `glassy`. You can set the variant using the `variant` input.

If none is specified, the default variant is `dark`.

### Dark (Default)

:::tabs

@tab Default

```html
<MultiSelectionToolbar /> <MultiSelectionToolbar variant="dark" />
```

@tab Light

```html
<MultiSelectionToolbar variant="light" />
```

@tab Glassy

```html
<MultiSelectionToolbar variant="glassy" />
```

:::

4. Save your changes.

Now, when you select one or more items in a result list, the multi-selection toolbar will appear at the bottom of the screen.

## Registering Documents for Selection

To enable document selection, you need to modify the component that displays your records (e.g., a "record card" component).
This involves updating both the component's logic (TypeScript) and its template (HTML).

### 1. Update the Component's Logic

In your component's TypeScript file (e.g., `record-card.ts`), you need to inject the `SelectionStore` and add the logic to handle the selection.

```ts
import { Component, computed, effect, inject, input, model } from '@angular/core';
import { SelectionStore } from '@sinequa/atomic-angular';
import { Article } from '@sinequa/atomic';

@Component({
  ...
})
export class RecordCard {
  public readonly article = model<Article>({} as Article);

  selectionStore = inject(SelectionStore);

  // state of checkbox for multi-select
  checked = signal<boolean>(false);
  multiSelected = computed(() => getState(this.selectionStore).multiSelection.find(a => a.id === this.article().id));

  constructor() {
    effect(() => {
      this.checked.set(!!this.multiSelected());
      this.article().$selected = !!this.multiSelected();
    });
  }

  onMultiSelectToggle(event: Event): void {
    event.stopImmediatePropagation();

    this.checked.set(!this.checked());

    if (this.article()) {
      this.article().$selected = !this.article().$selected;

      if (this.article().$selected) this.selectionStore.addArticleToMultiSelection(this.article());
      else this.selectionStore.removeArticleFromMultiSelection(this.article());
    }
  }
}
```

### 2. Update the Component's Template

In your component's HTML template (e.g., `record-card.html`), add a checkbox or another clickable element to trigger the selection.

```html
<div (click)="onMultiSelectToggle($event)">
  <input type="checkbox" [checked]="checked()" />
  <!-- You can style this checkbox as you wish -->
</div>

<!-- Display the rest of your record information here -->
<h2>{{ article().title }}</h2>
...
```

### 3. How it Works

1.  **`SelectionStore`**: This store is responsible for managing the list of selected documents.
2.  **`checked` and `multiSelected`**: These signals are used to keep the state of the checkbox in sync with the `SelectionStore`.
3.  **`onMultiSelectToggle`**: This method is called when the user clicks on the checkbox. It updates the `SelectionStore` by adding or removing the document from the selection.
4.  **`effect`**: The effect is used to automatically update the `checked` signal whenever the `multiSelected` computed signal changes.

When a document is added to or removed from the `SelectionStore`, the multi-selection toolbar will automatically update to reflect the number of selected items.

# Adding the _Select All_ Button

In your component's TypeScript file, you can add a method to handle the _Select All_ functionality.

```ts
import { Component, inject } from '@angular/core';

import { Article, bisect } from '@sinequa/atomic';
import { SelectionStore } from '@sinequa/atomic-angular';

@Component({
  ...
})
export class SearchPageComponent {
  selectionStore = inject(SelectionStore);

  articles = signal<Article[]>([]); // Assuming you have a signal for articles
  selectedAll = signal<'all' | 'some' | 'none'>('none'); // Signal to track selection state

  constructor() {
    // Effect to update the selectedAll signal based on the selection store
    effect(() => {
      // Get the IDs of articles and selected articles
      const articlesIds = this.articles().map(x => x.id));
      const selectionIds = this.selectionStore.multiSelection().map(x => x.id);

      // Use bisect to determine the selection state
      const b = bisect(articlesIds, x => selectionIds.includes(x));

      // For no truthy values, no articles from query has been selected yet
      if (b.true.length === 0) this.selectedAll.set('none');
      // For no falsy values, all articles from query are selected
      else if (b.false.length === 0) this.selectedAll.set('all');
      // Otherwise, some articles are selected
      else this.selectedAll.set('some');
    });
  }

  // Method to select all articles
  selectAll() {
    if (this.selectedAll() === 'all') {
      this.unselectAll();
      return;
    }

    this.articles().forEach(article => {
      article.$selected = true;
      this.selectionStore.addArticleToMultiSelection(article as Article);
    });
  }

  // Method to unselect all articles
  unselectAll() {
    this.articles().forEach(article => {
      article.$selected = false;
      this.selectionStore.removeArticleFromMultiSelection(article as Article);
    });
  }
}
```

In your component's HTML template, you can add a button to trigger the _Select All_ functionality.

```html
<button variant="ghost" (click)="selectAll()">
  @switch (selectedAll()) {
    @case ('all') {
      <i class="fa-fw fa-regular fa-square-check"></i>
      Unselect All
    }
    @case ('some') {
      <i class="fa-fw fa-regular fa-square-minus"></i>
      Select All
    }
    @default {
      <i class="fa-fw fa-regular fa-square"></i>
      Select All
    }
  }
</button>
```

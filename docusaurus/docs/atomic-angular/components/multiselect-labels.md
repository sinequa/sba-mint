---
title: Multiselect Labels
---

The `Multiselect Labels` feature allows users to search within all labels, or to create some, to apply them on an article. It displays an input to search or create, and below it are the badges of all applied ones which can also be removed on click.

## Usage

```ts title="sample.component.ts"
import { MultiSelectLabelsComponent } from "@angular/atomic-angular";

@Component({
    selector: "sample-component",
    imports: [MultiSelectLabelsComponent],
    template: `
    <multiselect-labels
        [(article)]="article"
        [labelsField]="labelsConfig()?.publicLabelsField"
        [allowModification]="labelsConfig()?.allowPublicLabelsModification || false"
        [isPublic]="true" />
    `,
})
export class SampleComponent {
    public readonly article = model<Article>({} as Article);
    public readonly labelsConfig = signal<LabelsConfig | undefined>(undefined);

    constructor(private destroyRef: DestroyRef) {
        this.labelService
            .getLabelsConfig()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(config => this.labelsConfig.set(config));
    }
}
```

### Properties

| Property         | Type                         | Description                                 |
|-----------------|------------------------------|---------------------------------------------|
| `article`   | `model<Article>`   | The article to manage the labels for                    |
| `isPublic`   | `input<boolean>`   | Whether it is for public or private labels                    |
| `allowModification`   | `input<boolean>`   | Whether the currently applied labels can be removed                    |
| `labelsField`         | `input<string | undefined>`            | The article field for labels                |
| `anchor`         | `signal<string>`            | An anchor to handle the labels suggestion popover properly                |
| `suggestedLabels`         | `signal<string[]>`            | The suggested labels upon writing on the input                |
| `labelInput`         | `model<string>`            | The model for the label input                |
| `debouncedLabelInput`         | `debouncedSignal`            | Debounced signal on the label input to trigger the suggestions fetching                |
| `popoverElement`         | `computed<ElementRef>`            | The popover HTML element                |
| `labels`         | `signal<string[]>`            | The currently applied labels                |
| `id`         | `signal<string>`            | The id for the label HTML element for the anchor                |

### Methods

| Method                | Description                                 |
|----------------------|---------------------------------------------|
| `itemClicked(label)`| On click on a suggested item to apply it    |
| `onInputClick()`| On input click to open the popover    |
| `onKeyDown(event)`| Watches input keydown to create the label if the user hits Enter    |
| `fetchLabels(text, isPublic)`| Fetches labels suggestion on the input text    |
| `addLabel(label, isPublic)`| Adds label to the article labels    |
| `updateArticleWithLabels()`| Update the article object with the current labels    |

### Features

- Displays the currently applied labels
- Displays an input to write some new label name or search for some displayed in a suggestion popover

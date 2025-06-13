---
title: Did You Mean
---

The `Did You Mean` feature facilitates the use of the `didYouMean` property for a result to propose some correction for it to easily apply to the query.

## Usage

```ts title="sample.component.ts"
import { DidYouMeanComponent } from "@angular/atomic-angular";

@Component({
    selector: "sample-component",
    template: `
      @if (result()) {
        <app-did-you-mean [result]="result()" />
      }
    `,
})
export class SampleComponent {
    result = signal<Result | undefined>(undefined);
}
```

### Properties

| Property         | Type                       | Description                                 |
|-----------------|----------------------------|---------------------------------------------|
| `result`     | `input<Result>`   | The query result                   |
| `spellingCorrectionMode`       | `computed<SpellingCorrectionMode>`                  | The correction mode (see `SpellingCorrectionMode` type in `@sinequa/atomic` for details)          |
| `correction`     | `computed<string>`   | The suggested correction                   |
| `original`         | `computed<string>`            | The original text from the query to be corrected              |

### Methods

| Method                | Description                                 |
|----------------------|---------------------------------------------|
| `selectCorrected()`  | Changes the query with the correction                   |
| `selectOriginal()`   | Forces the original text to be used by the search                       |

---
title: Did You Mean
sidebar_class_name: update
---

The `Did You Mean` feature facilitates the use of the `didYouMean` property for a result to propose some correction for it to easily apply to the query.

## API Reference

### Inputs

| Property   | Type            | Description         |
|------------|-----------------|---------------------|
| `result`   | `Result` | The query result    |

### Properties

| Property                  | Type                                         | Description                                                                 |
|---------------------------|----------------------------------------------|-----------------------------------------------------------------------------|
| `spellingCorrectionMode`  | `SpellingCorrectionMode`           | The correction mode (see `SpellingCorrectionMode` type in `@sinequa/atomic` for details) |
| `correction`              | `string`                           | The suggested correction                                                    |
| `original`                | `string`                           | The original text from the query to be corrected                            |

### Methods

| Method                | Description                                 |
|----------------------|---------------------------------------------|
| `selectCorrected()`  | Changes the query with the correction                   |
| `selectOriginal()`   | Forces the original text to be used by the search                       |

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

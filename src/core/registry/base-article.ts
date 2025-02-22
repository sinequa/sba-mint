import { Directive, input } from "@angular/core";
import { Article } from "@sinequa/atomic";
import { SelectionStrategy } from "@sinequa/atomic-angular";

/**
 * Base class for article components.
 * article is required and must be an Article or extend it.
 * strategy is optional and must be a SelectionStrategy for the drawer to decide how to handle the selection.
 */

@Directive({
  selector: "app-base-article",
  standalone: true
})
export abstract class BaseArticle<T extends Article> {
  public readonly article = input.required<T>();
  public readonly strategy = input<SelectionStrategy>();
}
import { Component, input } from "@angular/core";
import { Article } from "@sinequa/atomic";
import { SelectionStrategy } from "@sinequa/atomic-angular";

/**
 * Base class for article components.
 * article is required and must be an Article or extend it.
 * strategy is optional and must be a SelectionStrategy for the drawer to decide how to handle the selection.
 */

@Component({
  selector: "app-base-article",
  standalone: true,
  template: ``
})
export abstract class BaseArticle {
  public readonly article = input.required<Article>();
  public readonly strategy = input<SelectionStrategy>();
}
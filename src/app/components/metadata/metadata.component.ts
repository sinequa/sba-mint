import { cn } from "@/app/utils";
import { NgClass } from "@angular/common";
import { Component, computed, input } from "@angular/core";
import { Article, KeyOf, getMetadata } from "@sinequa/atomic";

@Component({
  selector: 'app-metadata',
  exportAs: 'metadata',
  standalone: true,
  imports: [NgClass],
  template: `

  @if(override()) {
    <ng-content></ng-content>
  }
  @else {
    <ng-content select="[before]"></ng-content>
    @for(item of items(); track $index) {
      @if(item.display) {
        <span [ngClass]="cn(default, className())">{{ item.display }}</span>
      }
    }
    <ng-content select="[after]"></ng-content>
  }
  `

})
export class MetadataComponent {
  override = input(false);
  className = input<string>();
  article = input.required<Partial<Article> | (string & Record<never, never>)>();
  metadata = input.required<KeyOf<Article> | (string & Record<never, never>)>();

  cn = cn;
  default = "text-ellipsis me-1";

  items = computed(() => {
    return getMetadata(this.article(), this.metadata());
  })
}
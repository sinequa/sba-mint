import { afterNextRender, Component, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { PreviewComponent } from '../../components/preview/preview';
import { AdvancedSearchComponent, SelectionStore } from '@sinequa/atomic-angular';
import { Article } from '@sinequa/atomic';

@Component({
  selector: 'page-preview',
  imports: [PreviewComponent, AdvancedSearchComponent, NgClass],
  template: `<div class="flex h-full flex-row">
    <preview class="h-full" [showExtended]="true" (onSearchInDocument)="article.set($event)" />

    <div [ngClass]="{ 'w-md': article(), 'w-0': !article() }" class="advanced-search bg-menu border-foreground/18 border-l">
      @if (article()) {
        <advanced-search class="h-full w-full overflow-y-auto" [article]="article()!" />
      }
    </div>
  </div>`,
  styles: `
    .advanced-search {
      transition:
        width 300ms ease-in-out,
        transform 300ms ease-in-out;
    }
  `
})
export class PreviewPage {
  selectionStore = inject(SelectionStore);

  id = input<string>();

  article = signal<Article | undefined>(undefined);

  constructor() {
    // Initialization logic can go here if needed
    afterNextRender(() => {
      this.selectionStore.update({ id: this.id() });
    });
  }
}

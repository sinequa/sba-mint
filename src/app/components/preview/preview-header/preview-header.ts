import { Component, computed, inject, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { Article as A, LegacyFilter } from '@sinequa/atomic';
import { AppStore, DocumentLocatorComponent, MetadataComponent, QueryParamsStore, TranslocoDateImpurePipe } from '@sinequa/atomic-angular';
import { ButtonComponent, cn } from '@sinequa/ui';

export type PreviewTab = 'summary' | 'preview' | 'discussion';
type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'app-preview-header',
  standalone: true,
  imports: [TranslocoPipe, TranslocoDateImpurePipe, ButtonComponent, DocumentLocatorComponent, MetadataComponent],
  templateUrl: './preview-header.html',
  styles: [
    `
      tr {
        display: grid;
        grid-template-columns: 25% auto;
        margin-bottom: --spacing(1);

        th {
          text-align: start;
          color: var(--color-neutral-500);
          font-weight: var(--font-medium);
          font-size: var(--text-xs);
          line-height: var(--text-xs--line-height);
          align-self: center;
        }
      }
    `
  ]
})
export class PreviewHeaderComponent {
  cn = cn;

  queryParamStore = inject(QueryParamsStore);
  labels = inject(AppStore).getLabels();

  article = input.required<Article>();

  headerCollapsed = signal<boolean>(false);

  hasLabels = computed(() => {
    const publicLabels = this.article()[this.labels.public];
    const privateLabels = this.article()[this.labels.private];
    return (publicLabels && publicLabels.length > 0) || (privateLabels && privateLabels.length > 0);
  });

  /**
   * Apply filter from the metadata click
   * @param field field to filter on
   * @param value value from the filter
   */
  onMetadataClick({ filter, event }: { filter: LegacyFilter; event: Event }): void {
    event.stopImmediatePropagation();
    this.queryParamStore.updateFilter(filter);
  }
}

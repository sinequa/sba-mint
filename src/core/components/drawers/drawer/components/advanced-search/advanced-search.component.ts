import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article } from '@sinequa/atomic';
import { AppStore, ApplicationStore, ArticleMetadata, MetadataComponent, PreviewService, ReplacePipe, SelectionStore } from '@sinequa/atomic-angular';
import { PanelDirective } from 'toolkit';

interface MetadataNavigation {
  index: number;
  value: string;
}

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../../../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  templateUrl: './advanced-search.component.html',
  styles: [`
    /* Hides cancel button from input that as type='search' */
    input[type="search"]::-webkit-search-cancel-button {
      -webkit-appearance: none;
    }
  `],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'border-l border-neutral-300 bg-white'
  },
  imports: [
    NgTemplateOutlet,
    FormsModule,
    PanelDirective,
    ReplacePipe,
    MetadataComponent,
    TranslocoPipe
  ],
  providers: [provideTranslocoScope({ scope: 'drawers', loader })]
})
export class AdvancedSearchComponent {
  public readonly article = input<Article | undefined>();
  public readonly textChanged = output<string>();

  public readonly labels = inject(AppStore).getLabels();
  private readonly applicationStore = inject(ApplicationStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly previewService = inject(PreviewService);

  protected readonly input = signal(getState(this.selectionStore).queryText || '');
  protected readonly extracts = computed(() => {
    getState(this.applicationStore);

    if (!this.article()) return [];

    return this.applicationStore.getExtracts(this.article()!.id)
  });

  public navigation = signal<MetadataNavigation | undefined>(undefined);
  public hovering = signal<string | undefined>(undefined);
  public hoverIndex = computed(() => this.navigation()?.value === this.hovering() ? this.navigation()!.index : 0);


  protected executeSearch(): void {
    this.textChanged.emit(this.input());
  }

  protected clearInput(): void {
    this.input.set('');
  }

  scrollTo(type: string, index: number, usePassageHighlighter: boolean = false) {
    this.previewService.sendMessage({ action: 'select', id: `${type}_${index}`, usePassageHighlighter });
  }

  navigateNext(entity: string, data: ArticleMetadata) {
    const index = this.navigation()?.value === data.value
      ? this.navigation()!.index < data.count! ? this.navigation()!.index + 1 : 1
      : 1;

    this.navigation.set({
      value: data.value,
      index
    });

    const id = this.previewService.getEntityId(entity, data.value, index - 1);
    if (id !== undefined) {
      this.scrollTo(entity, id);
    }
  }

  navigatePrev(entity: string, data: ArticleMetadata) {
    const index = this.navigation()?.value === data.value
      ? this.navigation()!.index <= 1 ? data.count! : this.navigation()!.index - 1
      : data.count!;

    this.navigation.set({
      value: data.value,
      index
    });

    const id = this.previewService.getEntityId(entity, data.value, index - 1);
    if (id !== undefined) {
      this.scrollTo(entity, id);
    }
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Article, CCWebService } from '@sinequa/atomic';
import { AppStore, ApplicationStore, ArticleMetadata, MetadataComponent, PreviewService, SelectionStore } from '@sinequa/atomic-angular';

interface MetadataNavigation {
  index: number;
  value: string;
}

type PreviewWebService = CCWebService & {
  highlights?: string,
}

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  templateUrl: './advanced-search.component.html',
  styles: [`
    :host {
      // disable default max-height for panel
      --panel-max-height: none;
    }
    /* Hides cancel button from input that as type='search' */
    input[type="search"]::-webkit-search-cancel-button {
      -webkit-appearance: none;
    }
  `],
  imports: [
    NgTemplateOutlet,
    FormsModule,
    MetadataComponent,
    TranslocoPipe
  ],
  providers: [provideTranslocoScope({ scope: 'drawers', loader })]
})
export class AdvancedSearchComponent implements OnDestroy {
  public readonly article = input.required<Article>();

  public readonly labels = inject(AppStore).getLabels();
  private readonly applicationStore = inject(ApplicationStore);
  private readonly appStore = inject(AppStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly previewService = inject(PreviewService);

  protected readonly input = signal(getState(this.selectionStore).queryText || '');
  protected readonly extracts = computed(() => {
    getState(this.applicationStore);

    if (!this.article()) return [];

    return this.applicationStore.getExtracts(this.article()!.id)
  });

  protected readonly previewHighlights = computed(() => {
    const highlights = (this.appStore.getWebServiceByType('preview') as PreviewWebService)?.highlights?.split(',')
      .filter(h => h !== 'extractslocations' && h !== 'matchlocations' && h !== 'matchingpassages');

    return highlights?.map(highlight => ({
      name: highlight,
      entity: highlight,
      metadata: (this.article() as any)[highlight]
    }));
  });

  public navigation = signal<MetadataNavigation | undefined>(undefined);
  public hovering = signal<string | undefined>(undefined);
  public hoverIndex = computed(() => this.navigation()?.value === this.hovering() ? this.navigation()!.index : 0);

  public readonly hasLabels = computed(() => {
    const article: any = this.article(); // required as any otherwise the lines below won't compile
    const publicLabels: string[] | undefined = article[this.labels.public];
    const privateLabels: string[] | undefined = article[this.labels.private];
    return (publicLabels && publicLabels.length > 0) || (privateLabels && privateLabels.length > 0);
  });

  loading = signal(true);
  protected subscription: Subscription;

  constructor() {
    this.subscription = this.previewService.events.subscribe(event => {
      switch(event) {
        case 'fetching':
          this.loading.set(true);
          break;
        default:
          this.loading.set(false);
          break;
      }
    });
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  protected executeSearch(): void {
    this.selectionStore.update({ queryText: this.input() });
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

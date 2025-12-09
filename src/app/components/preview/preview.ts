import { Component, computed, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { of } from 'rxjs';

import { Article as A, PreviewData, type CustomHighlights } from '@sinequa/atomic';
import {
  AdvancedSearchComponent,
  ApplicationService,
  AppStore,
  PreviewService,
  QueryParamsStore,
  SelectionStore,
  type PreviewHighlights
} from '@sinequa/atomic-angular';
import { cn } from '@sinequa/ui';

import { PreviewNavbarComponent } from './navbar/navbar';
import { PreviewHeaderComponent } from './preview-header/preview-header';
import { PreviewTabsComponent } from './preview-tabs/preview-tabs';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'preview, Preview',
  providers: [provideTranslocoScope({ scope: 'preview' })],
  imports: [PreviewNavbarComponent, PreviewTabsComponent, PreviewHeaderComponent, AdvancedSearchComponent],
  templateUrl: './preview.html',
  host: {
    '[class]':
      'cn("grow w-full h-full overflow-hidden grid transition-all ease-out duration-200", extended() ? "grid-cols-[auto_400px]" : "grid-cols-[auto_0%]")'
  }
})
export class PreviewComponent {
  cn = cn;

  protected readonly previewTabs = viewChild(PreviewTabsComponent);

  /* injectables */
  protected readonly appStore = inject(AppStore);
  protected readonly queryParamStore = inject(QueryParamsStore);
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly previewservice = inject(PreviewService);

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly applicationService = inject(ApplicationService);

  /* models used by inner components */
  protected readonly loading = computed(() => !this.previewservice.DOMContentLoaded());

  /* used to toggle the extended view when not displayed inside the drawer */
  protected readonly extended = signal(false);

  protected readonly article = signal<Article | undefined>(undefined);

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || '_query';
  protected locationSegments: string[] = [];

  // article ID is used to create an audit log entry when the preview is closed
  protected id = signal<string | undefined>(undefined);
  protected previewHighlights = signal<PreviewHighlights | undefined>(undefined);
  protected queryText = signal<string | undefined>(undefined);

  /* resources */
  public readonly previewDataResource = rxResource<PreviewData, { id: string; text: string; previewHighlights: CustomHighlights[] }>({
    params: () => {
      const { id = '', queryText = '', previewHighlights = { highlights: [] } } = getState(this.selectionStore);
      return { id: id, text: queryText, previewHighlights: previewHighlights?.highlights };
    },
    defaultValue: {} as PreviewData,
    stream: ({ params: { id, text, previewHighlights } }) => {
      if (id) {
        return this.previewservice.preview(id, { name: this.queryName, text }, previewHighlights);
      }
      return of({} as PreviewData);
    }
  });

  /* computed signals */
  previewData = computed(() => {
    if (this.previewDataResource.hasValue()) {
      return this.previewDataResource.value();
    }
    return undefined;
  });

  constructor() {
    // when the selection store changes or the article changes,
    // update the preview highlights and query text
    effect(() => {
      const { previewHighlights, id, queryText } = getState(this.selectionStore);
      const article = this.article();
      this.locationSegments = article?.url1 ? article.url1.split('/') : [];
      this.previewHighlights.set(previewHighlights);
      this.queryText.set(queryText);

      // only set the ID if the article is defined
      // this is to avoid setting the ID to undefined when the article is not defined usally when the preview is closed
      if (id) {
        this.id.set(id);
      }
    });

    // when the preview data changes, update the mini preview and chat with doc queries
    // this occurs when the preview API call returns
    effect(() => {
      if (!this.previewData()) return;
      if (!this.previewData()?.record) return;

      // create a new query for the mini preview assistant
      const { record } = this.previewData()!;
      this.article.set(record as Article | undefined);

      this.applicationService.setTitle(this.article()?.title || 'Preview');
    });

    // if the scrollTo event is emitted, set the active tab to preview if the active tab is not already preview
    effect(() => {
      const event = this.previewservice.events();

      // If the event is scrollTo, set the active tab to preview if it's not already
      if (event === 'scrollTo' && this.previewTabs()?.activeTabValue() !== 'preview') {
        this.previewTabs()?.setActiveTab('preview');
      }

      // If the event is scrollTo, set the events to idle to avoid multiple triggers
      if (event === 'scrollTo') {
        this.previewservice.events.set('idle');
      }
    });

    this.destroyRef.onDestroy(() => {
      const id = this.id();
      if (id) {
        this.previewDataResource.destroy();
        this.previewservice.close(id, { name: this.queryName });
      }
    });
  }
}

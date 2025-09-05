import { Component, computed, DestroyRef, effect, inject, model, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { of } from 'rxjs';

import { Article as A, CCApp, PreviewData, Query, type CustomHighlights } from '@sinequa/atomic';
import { APP_FEATURES, AppStore, PreviewService, QueryParamsStore, SelectionStore, type PreviewHighlights } from '@sinequa/atomic-angular';
import { TabContent } from '@sinequa/ui';

import { AssistantComponent } from '../assistant/assistant';
import { PreviewNavbarComponent } from './navbar/navbar';
import { PreviewContentComponent } from './preview-content/preview-content';
import { PreviewHeaderComponent } from './preview-header/preview-header';
import { PreviewTab, PreviewTabsComponent } from './preview-tabs/preview-tabs';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'preview, Preview',
  providers: [provideTranslocoScope({ scope: 'preview' })],
  imports: [AssistantComponent, PreviewNavbarComponent, PreviewTabsComponent, PreviewHeaderComponent, PreviewContentComponent, TabContent],
  templateUrl: './preview.html',
  host: {
    class: 'grow flex flex-col overflow-hidden h-full'
  }
})
export class PreviewComponent {
  /* injectables */
  protected readonly appStore = inject(AppStore);
  protected readonly queryParamStore = inject(QueryParamsStore);
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly previewservice = inject(PreviewService);

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly appFeatures = inject(APP_FEATURES);

  /* models used by inner components */
  protected readonly loading = computed(() => !this.previewservice.DOMContentLoaded());
  protected readonly activeTab = model<PreviewTab>('preview');

  // this signal is used by the summarize assistant to know if the assistant is streaming
  protected readonly isStreaming = signal<boolean>(false);
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
      const { id, queryText, previewHighlights } = getState(this.selectionStore);
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

  readonly summarizeInstanceId = computed(() => {
    const {
      assistant: { usePrefixName = true }
    } = this.appFeatures;
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-summarize-assistant`;
    } else {
      return 'preview-summarize-assistant';
    }
  });

  readonly chatWithDocIntanceId = computed(() => {
    const {
      assistant: { usePrefixName = true }
    } = this.appFeatures;
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-chatwithdoc-assistant`;
    } else {
      return 'preview-chatwithdoc-assistant';
    }
  });

  displaySummaryContent = computed(() => this.appStore.isAssistantAllowed(this.summarizeInstanceId()));
  displayChatWithDocContent = computed(() => this.appStore.isAssistantAllowed(this.chatWithDocIntanceId()));

  // this is set by the tabs component
  showAssistants = signal<{ name: 'summary' | 'discussion'; enabled: boolean; visible: boolean }[]>([
    { name: 'summary', enabled: false, visible: this.displaySummaryContent() },
    { name: 'discussion', enabled: false, visible: this.displayChatWithDocContent() }
  ]);
  showSummarizeAssistant = computed(() => this.showAssistants().find(assistant => assistant.name === 'summary')?.enabled);
  showChatWithDocAssistant = computed(() => this.showAssistants().find(assistant => assistant.name === 'discussion')?.enabled);

  miniPreviewQuery: Query = {} as Query;
  chatWithDocQuery: Query = {} as Query;

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
    effect(() => {
      if (!this.previewData()) return;
      if (!this.previewData()?.record) return;

      // create a new query for the mini preview assistant
      const { record } = this.previewData()!;
      this.article.set(record as Article | undefined);

      this.miniPreviewQuery = {
        name: this.appStore.getDefaultQuery()?.name || '_query',
        text: record.title,
        filters: { field: 'id', value: record.id, operator: 'eq' }
      };

      this.chatWithDocQuery = {
        name: this.appStore.getDefaultQuery()?.name || '_query',
        text: record.title,
        filters: { field: 'id', value: record.id, operator: 'eq' }
      };
    });

    // when the loading state changes, update the document title
    effect(() => {
      document.title = this.loading() ? 'Loading...' : this.article()?.title || 'Preview';
    });

    // if the scrollTo event is emitted, set the active tab to preview if the active tab is not already preview
    effect(() => {
      const event = this.previewservice.events();

      // If the event is scrollTo, set the active tab to preview if it's not already
      if (event === 'scrollTo' && this.activeTab() !== 'preview') {
        this.activeTab.set('preview');
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

  handleStreaming(isStreaming: boolean) {
    this.isStreaming.set(isStreaming);
  }
}

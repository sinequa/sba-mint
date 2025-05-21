import { ChangeDetectorRef, Component, computed, effect, inject, input, signal } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article as A, CCApp, PreviewData, Query } from '@sinequa/atomic';
import { AppStore, QueryParamsStore, SearchService, SelectionStore } from '@sinequa/atomic-angular';

import { APP_FEATURES } from '../../tokens';
import { AssistantComponent } from '../assistant/assistant';
import { PreviewNavbarComponent } from './navbar/navbar.component';
import { PreviewContentComponent } from './preview-content/preview-content';
import { PreviewHeaderComponent } from './preview-header/preview-header';
import { PreviewTab, PreviewTabsComponent } from './preview-tabs/preview-tabs';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'app-preview-default',
  providers: [provideTranslocoScope({ scope: 'preview' })],
  imports: [AssistantComponent, PreviewNavbarComponent, PreviewTabsComponent, PreviewHeaderComponent, PreviewContentComponent],
  templateUrl: './preview.html',
  host: {
    class: 'grow flex flex-col overflow-hidden'
  }
})
export class PreviewComponent {
  public readonly previewData = input.required<PreviewData>();
  public readonly article = computed(() => this.previewData()?.record as Article);

  protected readonly locationSegments = computed(() => this.article().treepath[0]?.split('/')?.slice(1, -1));
  protected readonly queryParamStore = inject(QueryParamsStore);
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly searchService = inject(SearchService);
  protected readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal<boolean>(false);
  readonly activeTab = signal<PreviewTab>('preview');

  appStore = inject(AppStore);
  appFeatures = inject(APP_FEATURES);

  // this signal is used by the summarize assistant to know if the assistant is streaming
  isStreaming = signal<boolean>(false);

  readonly summarizeInstanceId = computed(() => {
    const {
      assistant: { usePrefixName = true }
    } = this.appFeatures;
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-assistant`;
    } else {
      return 'preview-assistant';
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
    effect(() => {
      if (!this.previewData()) return;
      this.cdr.detectChanges();

      // create a new query for the mini preview assistant
      const { record } = this.previewData();

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

    effect(() => {
      document.title = this.loading() ? 'Loading...' : this.article()?.title || 'Preview';
    });
  }

  handleStreaming(isStreaming: boolean) {
    this.isStreaming.set(isStreaming);
  }
}

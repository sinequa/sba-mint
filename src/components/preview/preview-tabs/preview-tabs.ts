import { Component, computed, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { getState } from '@ngrx/signals';
import { Article, CCApp, Query } from '@sinequa/atomic';
import { AppStore, SelectionStore } from '@sinequa/atomic-angular';
import { TabComponent, TabContent, TabsComponent, TabsListComponent } from '@sinequa/ui';
import { AssistantComponent } from '../../assistant/assistant';
import { PreviewContentComponent } from '../preview-content/preview-content';

export type PreviewTab = 'summary' | 'preview' | 'discussion';

/**
 * Preview tabs component
 *
 * Usage:
 * ```html
 * <preview-tabs
 *    [article]="article">
 * </preview-tabs>
 * ```
 * Where `article` is the article to preview.
 * This component displays the preview tabs including document preview, summary, and discussion.
 * The summary and discussion tabs are conditionally displayed based on application features.
 *
 */
@Component({
  selector: 'preview-tabs, PreviewTabs, previewtabs',
  standalone: true,
  imports: [TranslocoPipe, TabsComponent, TabsListComponent, TabComponent, TabContent, AssistantComponent, PreviewContentComponent],
  template: `
    <Tabs class="block h-full @container">
      <!-- tabs list -->
      <TabsList class="w-full px-6 hidden @min-lg:flex" variant="ghost">
        <Tab variant="secondary" shadow="none" value="preview" active>
          <span sr-only>{{ 'preview.documentPreview' | transloco }}</span>
        </Tab>

        @if (displaySummary() || displayChatWithDoc()) {
          @if (displaySummary()) {
            <Tab variant="secondary" shadow="none" value="summary" (click)="setSummaryAssistant()">
              @if (isStreaming()) {
                <i class="fa-solid fa-spinner animate-spin"></i>
              } @else {
                <i class="fa-solid fa-sparkles"></i>
              }
              <span sr-only class="hidden @min-md:inline">{{ 'preview.summarize' | transloco }}</span>
            </Tab>
          }

          @if (displayChatWithDoc()) {
            <Tab variant="secondary" shadow="none" value="discussion" (click)="setChatWithDocAssistant()">
              <i class="fa-solid fa-comments"></i>
              <span sr-only class="hidden @min-md:inline">{{ 'preview.discussion' | transloco }}</span>
            </Tab>
          }
        }
      </TabsList>
      <!-- tabs content -->
      <div class="relative h-full grow overflow-auto">
        <!-- tab contents -->
        <!-- Summary Tab Content -->
        @if (displaySummaryContent() && summarizeInstanceId()) {
          <TabContent value="summary" class="absolute inset-0">
            <assistant
              [instanceId]="summarizeInstanceId()"
              [query]="miniPreviewQuery()"
              [showAssistant]="showSummarizeAssistant()"
              (isStreaming)="handleStreaming($event)"
            />
          </TabContent>
        }

        <!-- Chat with Doc Tab Content -->
        @if (displayChatWithDocContent() && chatWithDocIntanceId()) {
          <TabContent value="discussion" class="absolute inset-0">
            <assistant [instanceId]="chatWithDocIntanceId()" [query]="chatWithDocQuery()" [showAssistant]="showChatWithDocAssistant()" />
          </TabContent>
        }

        <!-- Preview Tab Content -->
        <TabContent value="preview" class="absolute inset-0">
          <preview-content class="px-6 pr-1" />
        </TabContent>
      </div>
    </Tabs>
  `
})
export class PreviewTabsComponent {
  protected tabs = viewChild(TabsComponent);

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly appStore = inject(AppStore);
  protected readonly appFeatures = this.appStore.general()?.features;
  protected readonly selectionStore = inject(SelectionStore);

  /**
   * A computed signal that returns the currently active preview tab value.
   *
   * @returns The active tab value cast as a PreviewTab type, or undefined if no tabs are available.
   */
  activeTabValue = computed<PreviewTab>(() => {
    return this.tabs()?.activeTabValue() as PreviewTab;
  });

  readonly article = signal<Article | undefined>(undefined);
  readonly miniPreviewQuery = computed(() => {
    const article = this.article();
    const query = {
      name: this.appStore.getDefaultQuery()?.name || '_query',
      text: article?.title,
      filters: { field: 'id', value: article?.id, operator: 'eq' }
    };
    return query as Query;
  });

  readonly chatWithDocQuery = computed(() => {
    const article = this.article();
    const query = {
      name: this.appStore.getDefaultQuery()?.name || '_query',
      text: article?.title,
      filters: { field: 'id', value: article?.id, operator: 'eq' }
    };
    return query as Query;
  });

  readonly summarizeInstanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-summarize-assistant`;
    } else {
      return 'preview-summarize-assistant';
    }
  });

  readonly chatWithDocIntanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-chatwithdoc-assistant`;
    } else {
      return 'preview-chatwithdoc-assistant';
    }
  });

  displaySummaryContent = computed(() => this.appStore.isAssistantAllowed(this.summarizeInstanceId()));
  displayChatWithDocContent = computed(() => this.appStore.isAssistantAllowed(this.chatWithDocIntanceId()));

  showAssistants = signal<{ name: 'summary' | 'discussion'; enabled: boolean; visible: boolean }[]>([
    { name: 'summary', enabled: false, visible: this.displaySummaryContent() },
    { name: 'discussion', enabled: false, visible: this.displayChatWithDocContent() }
  ]);
  showSummarizeAssistant = computed(() => this.showAssistants().find(assistant => assistant.name === 'summary')?.enabled);
  showChatWithDocAssistant = computed(() => this.showAssistants().find(assistant => assistant.name === 'discussion')?.enabled);

  protected readonly isStreaming = signal<boolean>(false);
  displaySummary = computed(() => this.showAssistants().some(assistant => assistant.name === 'summary' && assistant.visible));
  displayChatWithDoc = computed(() => this.showAssistants().some(assistant => assistant.name === 'discussion' && assistant.visible));

  constructor() {
    effect(() => {
      const { article } = getState(this.selectionStore);
      this.article.set(article as Article);
    });
  }

  setActiveTab(tab: PreviewTab) {
    this.tabs()?.setActiveTab(tab);
  }

  setSummaryAssistant() {
    const assistants = this.showAssistants().filter(assistant => assistant.name !== 'summary');
    this.showAssistants.set([...assistants, { name: 'summary', enabled: true, visible: true }]);
  }
  setChatWithDocAssistant() {
    const assistants = this.showAssistants().filter(assistant => assistant.name !== 'discussion');
    this.showAssistants.set([...assistants, { name: 'discussion', enabled: true, visible: true }]);
  }

  handleStreaming(isStreaming: boolean) {
    this.isStreaming.set(isStreaming);
  }
}

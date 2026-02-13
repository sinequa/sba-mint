import { Component, computed, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { getState } from '@ngrx/signals';
import { Article, CCApp, PreviewData, Query } from '@sinequa/atomic';
import { AppStore, SelectionStore } from '@sinequa/atomic-angular';
import { TabComponent, TabContent, TabsComponent, TabsListComponent } from '@sinequa/ui';
import { AssistantComponent } from '../../assistant/assistant';
import { PreviewContentComponent } from '../preview-content/preview-content';
import { FormsModule } from '@angular/forms';

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
  imports: [FormsModule, TranslocoPipe, TabsComponent, TabsListComponent, TabComponent, TabContent, AssistantComponent, PreviewContentComponent],
  template: `
    <Tabs class="contents">
      <!-- tabs list -->
      <TabsList class="w-full px-6" variant="ghost">
        <Tab class="w-fit" shadow="none" value="preview" active>
          {{ 'preview.documentPreview' | transloco }}
        </Tab>

        @if (displaySummary() || displayChatWithDoc()) {
          @if (displaySummary()) {
            <Tab class="w-fit" variant="ai" shadow="none" value="summary" (click)="setSummaryAssistant()">
              @if (isStreaming()) {
                <i class="fa-solid fa-spinner animate-spin"></i>
              } @else {
                <i class="fa-solid fa-sparkles"></i>
              }
              {{ 'preview.summarize' | transloco }}
            </Tab>
          }

          @if (displayChatWithDoc()) {
            <Tab class="w-fit" variant="ai" shadow="none" value="discussion" (click)="setChatWithDocAssistant()">
              <i class="fa-solid fa-comments"></i>
              {{ 'preview.discussion' | transloco }}
            </Tab>
          }

          @if (converterOptions()?.length) {
            <div class="grow"></div>
            <select
              class="hover:outline-primary focus:outline-primary border-foreground/10 bg-background hover:bg-muted focus:bg-muted h-8 rounded-md border px-2 hover:outline focus:outline"
              [ngModel]="conversionUrl()"
              (ngModelChange)="conversionUrl.set($event)">
              <option [value]="undefined">{{ 'preview.default' | transloco }}</option>
              @for (option of converterOptions(); track $index) {
                <option [value]="option.conversion!.url">{{ option.name || option.displayFallback }}</option>
              }
            </select>
          }
        }
      </TabsList>
      <!-- tabs content -->
      <div class="relative h-full flex-grow overflow-auto">
        <!-- tab contents -->
        <!-- Summary Tab Content -->
        @if (displaySummaryContent() && summarizeInstanceId()) {
          <TabContent value="summary" class="absolute inset-0">
            <assistant
              [instanceId]="summarizeInstanceId()"
              [query]="miniPreviewQuery()"
              [showAssistant]="showSummarizeAssistant()"
              (isStreaming)="handleStreaming($event)"
              class="flex-grow" />
          </TabContent>
        }

        <!-- Chat with Doc Tab Content -->
        @if (displayChatWithDocContent() && chatWithDocIntanceId()) {
          <TabContent value="discussion" class="absolute inset-0">
            <assistant [instanceId]="chatWithDocIntanceId()" [query]="chatWithDocQuery()" [showAssistant]="showChatWithDocAssistant()" class="flex-grow" />
          </TabContent>
        }

        <!-- Preview Tab Content -->
        <TabContent value="preview" class="absolute inset-0">
          <preview-content class="px-6 pr-1" [conversionUrl]="conversionUrl()" (onLoadedData)="previewData.set($event)" />
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
  readonly previewData = signal<PreviewData | undefined>(undefined);
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
  previewMultiConversion = computed(() => this.appStore.general()?.features?.previewMultiConversion);

  protected readonly isStreaming = signal<boolean>(false);
  displaySummary = computed(() => this.showAssistants().some(assistant => assistant.name === 'summary' && assistant.visible));
  displayChatWithDoc = computed(() => this.showAssistants().some(assistant => assistant.name === 'discussion' && assistant.visible));

  /** List of all available converters matching with previewData.conversions and the config defined general.converters */
  conversionUrl = signal<string | undefined>(undefined);
  converters = computed(() =>
    !this.previewData()?.conversions?.length
      ? undefined
      : this.appStore
          .general()
          ?.converters?.filter(
            converter =>
              converter.display && this.previewData()!.conversions!.some(c => c.converterName === converter.converter && c.format === converter.format)
          )
  );

  /** All options for the converters dropdown */
  converterOptions = computed(() => {
    // return undefined if the feature is disabled or that there are no available conversions
    if (!this.previewMultiConversion() || !this.converters()?.length) return undefined;

    return this.converters()!
      .map(converter => {
        const conversion = this.previewData()!.conversions!.find(c => c.converterName === converter.converter && c.format === converter.format);
        const displayFallback = `${converter.primary ? 'Primary-' : ''}${converter.format}-${converter.converter}`;
        return { ...converter, displayFallback, conversion };
      })
      .sort((a, b) => (a.default && !b.default ? -1 : 1));
  });

  constructor() {
    effect(() => {
      const { article } = getState(this.selectionStore);
      this.article.set(article as Article);
    });

    effect(() => {
      // set conversion url to the first default converter if any
      if (this.previewMultiConversion() || this.converterOptions()?.length) {
        this.conversionUrl.set(this.converterOptions()!.find(c => c.default)?.conversion?.url);
      }
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

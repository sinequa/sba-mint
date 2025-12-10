import { Component, computed, DestroyRef, effect, inject, input, model, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { APP_FEATURES, AppStore, PreviewService } from '@sinequa/atomic-angular';
import { TabComponent, TabsComponent, TabsListComponent, TabContent } from '@sinequa/ui';
import { AssistantComponent } from '../../assistant/assistant';
import { CCApp, PreviewData, Query } from '@sinequa/atomic';
import { getState } from '@ngrx/signals';
import { PreviewContentComponent } from '../preview-content/preview-content';

export type PreviewTab = 'summary' | 'preview' | 'discussion';

@Component({
  selector: 'preview-tabs, PreviewTabs, previewtabs',
  standalone: true,
  imports: [TranslocoPipe, TabsComponent, TabsListComponent, TabComponent, TabContent, AssistantComponent, PreviewContentComponent],
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
        }
      </TabsList>
      <!-- tabs content -->
      <div class="relative h-full flex-grow overflow-auto">
        <!-- tab contents -->
        <!-- Summary Tab Content -->
        @if (displaySummaryContent()) {
          <TabContent value="summary" class="absolute inset-0">
            <assistant
              [instanceId]="summarizeInstanceId()"
              [query]="miniPreviewQuery"
              [showAssistant]="showSummarizeAssistant()"
              (isStreaming)="handleStreaming($event)"
              class="flex-grow" />
          </TabContent>
        }

        <!-- Chat with Doc Tab Content -->
        @if (displayChatWithDocContent()) {
          <TabContent value="discussion" class="absolute inset-0">
            <assistant [instanceId]="chatWithDocIntanceId()" [query]="chatWithDocQuery" [showAssistant]="showChatWithDocAssistant()" class="flex-grow" />
          </TabContent>
        }

        <!-- Preview Tab Content -->
        <TabContent value="preview" class="absolute inset-0">
          <preview-content class="px-6 pr-1" [previewData]="previewData()!" />
        </TabContent>
      </div>
    </Tabs>
  `
})
export class PreviewTabsComponent {
  protected tabs = viewChild(TabsComponent);

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly previewService = inject(PreviewService);
  protected readonly appStore = inject(AppStore);
  protected readonly appFeatures = inject(APP_FEATURES);

  /**
   * A computed signal that returns the currently active preview tab value.
   *
   * @returns The active tab value cast as a PreviewTab type, or undefined if no tabs are available.
   */
  activeTabValue = computed<PreviewTab>(() => {
    return this.tabs()?.activeTabValue() as PreviewTab;
  });

  previewData = input<PreviewData | undefined>(undefined);

  miniPreviewQuery: Query = {} as Query;
  chatWithDocQuery: Query = {} as Query;

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
      if (!this.previewData()) return;
      if (!this.previewData()?.record) return;

      // create a new query for the mini preview assistant
      const { record } = this.previewData()!;

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

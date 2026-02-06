import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Article, CCApp, Query } from '@sinequa/atomic';
import { AdvancedSearch, AppStore, PreviewService, SelectionStore } from '@sinequa/atomic-angular';
import {
  ButtonComponent,
  ChevronLeftIconComponent,
  ChevronRightIcon,
  DialogComponent,
  DialogContentComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  Separator,
  TabComponent,
  TabsComponent
} from '@sinequa/ui';
import { AssistantComponent } from '../../assistant/assistant';
import { PreviewContentComponent } from '../preview-content/preview-content';

/**
 * Preview dialog component
 *
 * Usage:
 * ```html
 * <preview-dialog></preview-dialog>
 * ```
 * This component provides a dialog interface for previewing articles.
 * It includes tabs for chat, summary, and find functionalities,
 * and integrates with the assistant feature for enhanced user interaction.
 *
 */
@Component({
  selector: 'preview-dialog, PreviewDialog, previewdialog',
  imports: [
    ButtonComponent,
    DialogComponent,
    DialogContentComponent,
    DialogTitleComponent,
    DialogHeaderComponent,
    PreviewContentComponent,
    TabsComponent,
    TabComponent,
    TranslocoPipe,
    AssistantComponent,
    AdvancedSearch,
    ChevronRightIcon,
    ChevronLeftIconComponent,
    Separator
  ],
  providers: [PreviewService],
  templateUrl: './preview-dialog.html'
})
export class PreviewDialogComponent {
  protected readonly appStore = inject(AppStore);
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly previewService = inject(PreviewService);
  protected readonly appFeatures = this.appStore.general()?.features;

  public readonly article = signal<Article | undefined>(undefined);
  public readonly activeTab = signal<'chat' | 'summary' | 'find'>('chat');
  public readonly sidebarExpanded = signal<boolean>(true);

  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || '_query';

  chatWithDocQuery: Query = {} as Query;
  miniPreviewQuery: Query = {} as Query;

  readonly chatWithDocIntanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-preview-chatwithdoc-assistant`;
    } else {
      return 'preview-chatwithdoc-assistant';
    }
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

  displaySummaryContent = computed(() => this.appStore.isAssistantAllowed(this.summarizeInstanceId()));
  displayChatWithDocContent = computed(() => this.appStore.isAssistantAllowed(this.chatWithDocIntanceId()));

  constructor() {
    effect(() => {
      if (this.activeTab() === 'chat' && !this.displayChatWithDocContent()) {
        this.activeTab.set(this.displaySummaryContent() ? 'summary' : 'find');
      } else if (this.activeTab() === 'summary' && !this.displaySummaryContent()) {
        this.activeTab.set('find');
      }
    });
  }

  open(article: Article) {
    this.article.set(article);
    this.chatWithDocQuery = {
      name: this.appStore.getDefaultQuery()?.name || '_query',
      text: article.title,
      filters: { field: 'id', value: article.id, operator: 'eq' }
    };
    this.miniPreviewQuery = {
      name: this.appStore.getDefaultQuery()?.name || '_query',
      text: article.title,
      filters: { field: 'id', value: article.id, operator: 'eq' }
    };
    this.dialog()!.showModal();
  }
}

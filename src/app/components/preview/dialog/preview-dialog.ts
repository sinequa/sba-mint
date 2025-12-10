import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Article, CCApp, CustomHighlights, PreviewData, Query } from '@sinequa/atomic';
import { AdvancedSearchComponent, APP_FEATURES, AppStore, PreviewService, SelectionStore } from '@sinequa/atomic-angular';
import {
  DialogComponent,
  DialogContentComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  TabComponent,
  TabsComponent,
  ChevronRightIcon,
  ChevronLeftIconComponent,
  ButtonComponent,
  Separator
} from '@sinequa/ui';
import { of } from 'rxjs';
import { AssistantComponent } from '../../assistant/assistant';
import { PreviewContentComponent } from '../preview-content/preview-content';

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
    AdvancedSearchComponent,
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
  protected readonly previewservice = inject(PreviewService);
  protected readonly appFeatures = inject(APP_FEATURES);

  public readonly article = signal<Article | undefined>(undefined);
  public readonly activeTab = signal<'chat' | 'summary' | 'find'>('chat');
  public readonly sidebarExpanded = signal<boolean>(true);

  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || '_query';

  chatWithDocQuery: Query = {} as Query;
  miniPreviewQuery: Query = {} as Query;

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

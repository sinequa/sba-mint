import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Article, CCApp, CustomHighlights, PreviewData, Query } from '@sinequa/atomic';
import { DialogComponent, DialogContentComponent, DialogHeaderComponent, DialogTitleComponent, TabsComponent, TabComponent } from '@sinequa/ui';
import { PreviewContentComponent } from '../preview-content/preview-content';
import { rxResource } from '@angular/core/rxjs-interop';
import { getState } from '@ngrx/signals';
import { APP_FEATURES, AppStore, PreviewService, SelectionStore, AdvancedSearchComponent } from '@sinequa/atomic-angular';
import { of } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { AssistantComponent } from '../../assistant/assistant';

@Component({
  selector: 'preview-dialog, PreviewDialog, previewdialog',
  imports: [
    DialogComponent,
    DialogContentComponent,
    DialogTitleComponent,
    DialogHeaderComponent,
    PreviewContentComponent,
    TabsComponent,
    TabComponent,
    TranslocoPipe,
    AssistantComponent,
    AdvancedSearchComponent
  ],
  templateUrl: './preview-dialog.html'
})
export class PreviewDialogComponent {
  protected readonly appStore = inject(AppStore);
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly previewservice = inject(PreviewService);
  protected readonly appFeatures = inject(APP_FEATURES);

  public readonly article = signal<Article | undefined>(undefined);
  public readonly activeTab = signal<'chat' | 'find'>('chat');

  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  protected readonly queryName = this.appStore.getDefaultQuery()?.name || '_query';

  chatWithDocQuery: Query = {} as Query;

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
    effect(() => {
      if (!this.previewData()) return;
      if (!this.previewData()?.record) return;

      // create a new query for the mini preview assistant
      const { record } = this.previewData()!;
      this.article.set(record as Article | undefined);

      this.chatWithDocQuery = {
        name: this.appStore.getDefaultQuery()?.name || '_query',
        text: record.title,
        filters: { field: 'id', value: record.id, operator: 'eq' }
      };
    });
  }

  open() {
    this.dialog()!.showModal();
  }
}

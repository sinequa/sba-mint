import { AsyncPipe, NgClass, NgComponentOutlet } from '@angular/common';
import { Component, Inject, InjectionToken, OnDestroy, OnInit, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { getState } from '@ngrx/signals';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { Article, CCApp, PreviewData } from '@sinequa/atomic';

import { AppStore, PreviewService, QueryParamsStore, SelectionStore } from '@sinequa/atomic-angular';

import { PreviewDefaultComponent } from '@/core/components/preview/default/preview-default.component';
import { PreviewSlideComponent } from '@/core/components/preview/slide/preview-slide.component';
import { getComponentsForDocumentType } from '@/app/registry/document-type-registry';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';
import { DrawerComponent } from '../drawer.component';
import { DrawerService } from '../drawer.service';

const GLOBAL_QUERY_NAME = new InjectionToken<string>('GLOBAL_QUERY_NAME', {
  factory() {
    const appStore = inject(AppStore);
    const { queries } = getState(appStore) as CCApp;

    if (!queries) return '';

    const array = Object.entries(queries).map(([key, value]) => ({ key, ...value }));

    return array[0].name;
  }
})

@Component({
  selector: 'app-drawer-preview',
  standalone: true,
  imports: [
    NgClass,
    NgComponentOutlet,
    AsyncPipe,
    AdvancedSearchComponent
  ],
  providers: [DrawerService, PreviewService],
  templateUrl: './drawer-preview.component.html',
  styleUrls: ['../drawer.component.scss']
})
export class DrawerPreviewComponent extends DrawerComponent implements OnInit, OnDestroy {
  appStore = inject(AppStore);
  selectionStore = inject(SelectionStore);
  queryParamsStore = inject(QueryParamsStore);

  previewService = inject(PreviewService);

  queryText = computed(() => {
    const { queryText } = getState(this.selectionStore);
    const { text } = getState(this.queryParamsStore);
    return queryText ?? text;
  });

  public readonly articleId = input.required<string>();

  public readonly previewData = signal<PreviewData | undefined>(undefined);
  public readonly article = computed(() => this.previewData()?.record as Article);

  public readonly inputs = computed(() => ({ previewData: this.previewData() }));
  public readonly previewType = computed(() => {
    if (!this.article()?.docformat) return undefined;

    return getComponentsForDocumentType(this.article()?.docformat || '').previewComponent;
  })


  constructor(@Inject(GLOBAL_QUERY_NAME) private readonly globalQueryName: string) {
    super();

    effect(() => {
      const articleId = this.articleId();
      const text = this.queryText();

      untracked(async () => {
        const state = getState(this.selectionStore);
        const previewData = await firstValueFrom(this.previewService.preview
          (
            articleId,
            {
              name: this.globalQueryName,
              text
            },
            state.previewHighlights?.highlights
          )
        );

        this.previewData.set(previewData);
      });

    });
  }

  override ngOnDestroy(): void {
    this.previewService.close(this.articleId(), { name: this.globalQueryName });
  }

}

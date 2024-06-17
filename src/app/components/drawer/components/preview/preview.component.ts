import { AsyncPipe, NgClass, NgComponentOutlet } from '@angular/common';
import { Component, Inject, InjectionToken, OnInit, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map, shareReplay, switchMap } from 'rxjs';

import { QueryService } from '@sinequa/atomic-angular';

import { PreviewDefaultComponent } from '@/app/components/preview/default/preview-default.component';
import { PreviewSlideComponent } from '@/app/components/preview/slide/preview-slide.component';
import { ExtractsLocationService, PreviewService } from '@/app/services/preview';
import { AppStore, QueryParamsStore } from '@/app/stores';
import { Article } from '@/app/types';
import { articleTypesMap, getTypeMapForArticleSTab } from '@/app/utils';
import { DrawerComponent } from '../../drawer.component';
import { DrawerService } from '../../drawer.service';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';
import { getState } from '@ngrx/signals';

const GLOBAL_QUERY_NAME = new InjectionToken<string>('GLOBAL_QUERY_NAME', {
  factory() {
    const appStore = inject(AppStore);
    const { queries } = getState(appStore);

    if(!queries) return '';

    const array = Object.entries(queries).map(([key, value]) => ({key, ...value}));
    console.log("injection token", array[0].name);
    return array[0].name;
  }
})

@Component({
  selector: 'app-drawer-preview',
  standalone: true,
  imports: [NgClass, NgComponentOutlet, AsyncPipe, AdvancedSearchComponent, PreviewDefaultComponent, PreviewSlideComponent],
  providers: [DrawerService, PreviewService, ExtractsLocationService],
  templateUrl: './preview.component.html',
  styleUrls: ['../../drawer.component.scss', './preview.component.scss']
})
export class DrawerPreviewComponent extends DrawerComponent implements OnInit {
  queryParamsStore = inject(QueryParamsStore);
  queryText = computed(() => getState(this.queryParamsStore).text ?? '');

  public readonly articleId = input.required<string>();
  public readonly text = new BehaviorSubject<string>(this.queryText());

  public readonly previewData$ = combineLatest([toObservable(this.articleId), this.text])
    .pipe(
      switchMap(([articleId, text]) => this.queryService.preview(articleId, { name: this.globalQueryName, text })),
      // shareReplay is used to prevent multiple requests when multiple properties are bound to this observable
      shareReplay(1)
    );
  public readonly article$ = this.previewData$.pipe(map(data => data.record as Article));

  public readonly previewData = toSignal(this.previewData$);
  public readonly article = toSignal(this.article$);

  public readonly inputs = computed(() => ({ previewData: this.previewData() }));
  public readonly previewType = computed(() => {
    const tab = this.article()?.['s_tab'];

    if (tab)
      return getTypeMapForArticleSTab(tab) ?? articleTypesMap[0];

    console.warn('No s_tab found for article, fallback to default preview');

    return articleTypesMap[0];
  });

  private readonly queryService = inject(QueryService);

  constructor(@Inject(GLOBAL_QUERY_NAME) private readonly globalQueryName: string) {
    super();
  }

  public onTextChanged(text: string): void {
    this.text.next(text);
  }
}

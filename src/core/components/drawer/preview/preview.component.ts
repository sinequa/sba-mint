import { AsyncPipe, NgClass, NgComponentOutlet } from '@angular/common';
import { Component, Inject, InjectionToken, OnDestroy, OnInit, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getState } from '@ngrx/signals';
import { BehaviorSubject, combineLatest, map, shareReplay, switchMap } from 'rxjs';

import { Article, CCApp } from '@sinequa/atomic';

import { AppStore, ExtractsLocationService, PreviewService, QueryParamsStore } from '@sinequa/atomic-angular';

import { PreviewDefaultComponent } from '@/core/components/preview/default/preview-default.component';
import { PreviewSlideComponent } from '@/core/components/preview/slide/preview-slide.component';
import { getComponentsForDocumentType } from '@/core/registry/document-type-registry';
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
    AdvancedSearchComponent,
    PreviewDefaultComponent,
    PreviewSlideComponent
  ],
  providers: [DrawerService, PreviewService, ExtractsLocationService],
  templateUrl: './preview.component.html',
  styleUrls: ['../drawer.component.scss']
})
export class DrawerPreviewComponent extends DrawerComponent implements OnInit, OnDestroy {
  previewService = inject(PreviewService);
  queryParamsStore = inject(QueryParamsStore);
  queryText = computed(() => {
    const { text } = getState(this.queryParamsStore);
    return text ?? '';
  });

  public readonly articleId = input.required<string>();
  public readonly text = new BehaviorSubject<string>(this.queryText());

  public readonly previewData$ = combineLatest([toObservable(this.articleId), this.text])
    .pipe(
      switchMap(([articleId, text]) => this.previewService.preview(articleId, { name: this.globalQueryName, text })),
      // shareReplay is used to prevent multiple requests when multiple properties are bound to this observable
      shareReplay(1)
    );
  public readonly article$ = this.previewData$.pipe(map(data => data.record as Article));

  public readonly previewData = toSignal(this.previewData$);
  public readonly article = toSignal(this.article$);

  public readonly inputs = computed(() => ({ previewData: this.previewData() }));
  public readonly previewType = computed(() => {
    if (!this.article()?.docformat) return undefined;

    return getComponentsForDocumentType(this.article()?.docformat || '').previewComponent;
  })


  constructor(@Inject(GLOBAL_QUERY_NAME) private readonly globalQueryName: string) {
    super();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.text.complete();
    this.previewService.close(this.articleId(), { name: this.globalQueryName });
  }

  public onTextChanged(text: string): void {
    this.text.next(text);
  }
}

import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, QueryList, ViewChild, ViewChildren, computed, inject, input, runInInjectionContext, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { getState } from '@ngrx/signals';
import { Subscription, combineLatest, map, switchMap } from 'rxjs';

import { PreviewData } from '@sinequa/atomic';
import { MetadataComponent, SplitPipe } from '@sinequa/atomic-angular';

import { AuthorComponent } from '@/app/components/author/author.component';
import { PreviewService } from '@/app/services/preview';
import { AppStore, SelectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { buildQuery } from '@/app/utils';

import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { PreviewActionsComponent } from "../actions/preview-actions";
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-default',
  standalone: true,
  imports: [NgClass, DatePipe, SlicePipe, SplitPipe, PreviewNavbarComponent, AuthorComponent, MetadataComponent, PreviewActionsComponent, SourceIconComponent],
  templateUrl: './preview-default.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'grow flex flex-col overflow-hidden'
  },
  styleUrl: './preview-default.component.scss'
})
export class PreviewDefaultComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('preview') public readonly iframes: QueryList<ElementRef<HTMLIFrameElement>>;

  @ViewChild('preview') public readonly iframe: ElementRef<HTMLIFrameElement>;

  public get preview(): Window | null {
    return this.iframe.nativeElement?.contentWindow;
  }

  public _article = input.required<Article>({ alias: 'article' });
  protected article = computed(() => {
    const { article } = getState(this.selectionStore) || this._article();
    if(article && !article.treepath) {
      article.treepath = ['/'];
    }
    return article as Article;
  })

  qureryText = computed(() => {
    const { queryText } = getState(this.selectionStore);
    return queryText;
  })

  public readonly previewUrl = toSignal(
    combineLatest(toObservable(this.article), toObservable(this.qureryText)).pipe(
      switchMap(([article, text]) => this.previewService.preview(
        article.id ?? '',
        runInInjectionContext(this.injector, () => buildQuery({ name: article.$queryName, text}))
      )),
      map((data: PreviewData) => this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + data?.documentCachedContentUrl))
    ), { initialValue: undefined }
  )

  public labels = inject(AppStore).getLabels();

  readonly headerCollapsed = signal<boolean>(false);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly previewService = inject(PreviewService);
  private readonly selectionStore = inject(SelectionStore);

  private readonly sub = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngAfterViewInit() {
    this.sub.add(
      this.iframes.changes
        .subscribe((iframes: QueryList<ElementRef<HTMLIFrameElement>>) => {
          if(iframes.first) {
            this.previewService.setIframe(iframes.first.nativeElement.contentWindow);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

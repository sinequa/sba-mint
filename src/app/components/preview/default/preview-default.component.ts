import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, QueryList, ViewChild, ViewChildren, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { PreviewData, fetchPreview } from '@sinequa/atomic';
import { MetadataComponent, SplitPipe } from '@sinequa/atomic-angular';

import { SourceIconPipe } from '@/app/pipes/source-icon.pipe';
import { BookmarksService } from '@/app/services/bookmarks.service';
import { PreviewService } from '@/app/services/preview';
import { AppStore, SelectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { buildQuery } from '@/app/utils';
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';

import { getState } from '@ngrx/signals';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-default',
  standalone: true,
  imports: [NgClass, DatePipe, SlicePipe, SplitPipe, SourceIconPipe, PreviewNavbarComponent, WpsAuthorComponent, MetadataComponent],
  templateUrl: './preview-default.component.html',
  styleUrl: './preview-default.component.scss'
})
export class PreviewDefaultComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('preview') public readonly iframes: QueryList<ElementRef<HTMLIFrameElement>>;

  @ViewChild('preview') public readonly iframe: ElementRef<HTMLIFrameElement>;

  public get preview(): Window | null {
    return this.iframe?.nativeElement?.contentWindow;
  }

  public _article = input.required<Article>({ alias: 'article' });
  protected article = signal<Article>({treepath: [] as string[] } as Article);

  public readonly previewUrl = signal<SafeUrl | undefined>(undefined);

  public labels = inject(AppStore).getLabels();

  readonly headerCollapsed = signal<boolean>(false);

  private readonly sanitizer = inject(DomSanitizer);
  private readonly previewService = inject(PreviewService);
  private readonly bookmarkService = inject(BookmarksService);
  private readonly selectionStore = inject(SelectionStore);

  private readonly sub = new Subscription();

  constructor(private readonly injector: Injector) {
    effect(() => {
      const {article} = getState(this.selectionStore) || this._article();
      if(article) {
        this.article.set(article);
        this.previewService.setIframe(this.preview);
      }

      if (article?.id)
        fetchPreview(
          article.id ?? '',
          runInInjectionContext(this.injector, () => buildQuery())
        ).then((data: PreviewData) => {
          this.previewService.setPreviewData(data);
          this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + data?.documentCachedContentUrl));
        });
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit() {
    this.sub.add(
      this.iframes.changes.subscribe(
        (iframes: QueryList<ElementRef<HTMLIFrameElement>>) => this.previewService.setIframe(iframes.first.nativeElement.contentWindow)
      )
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public async toggleBookmark(): Promise<void> {
    const article = this._article() || this.article();
    if (article?.id === undefined) return;

    const isBookmarked = await this.bookmarkService.isBookmarked(article.id);

    if (isBookmarked)
      this.bookmarkService.unbookmark(article.id);
    else
      this.bookmarkService.bookmark(article);
  }
}

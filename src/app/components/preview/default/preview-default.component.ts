import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, QueryList, ViewChild, ViewChildren, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { PreviewData, fetchPreview } from '@sinequa/atomic';
import { SplitPipe } from '@sinequa/atomic-angular';

import { MetadataComponent } from '@/app/components/metadata/metadata.component';
import { TreepathToIconClassPipe } from '@/app/pipes/treepath-to-icon-class.pipe';
import { BookmarksService } from '@/app/services/bookmarks.service';
import { PreviewService } from '@/app/services/preview';
import { appStore, selectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { buildQuery } from '@/app/utils';
import { WpsAuthorComponent } from '@/app/wps-components/author/author.component';

import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-default',
  standalone: true,
  imports: [NgClass, DatePipe, SlicePipe, SplitPipe, TreepathToIconClassPipe, PreviewNavbarComponent, WpsAuthorComponent, MetadataComponent],
  templateUrl: './preview-default.component.html',
  styleUrl: './preview-default.component.scss'
})
export class PreviewDefaultComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('preview') public readonly iframes: QueryList<ElementRef<HTMLIFrameElement>>;

  @ViewChild('preview') public readonly iframe: ElementRef<HTMLIFrameElement>;

  public get preview(): Window | null {
    return this.iframe?.nativeElement?.contentWindow;
  }

  public readonly article = input<Partial<Article>>();
  public readonly previewUrl = signal<SafeUrl | undefined>(undefined);

  public labels = {public: '', private: ''};

  readonly headerCollapsed = signal<boolean>(false);

  private readonly sanitizer = inject(DomSanitizer);
  private readonly previewService = inject(PreviewService);
  private readonly bookmarkService = inject(BookmarksService);

  private readonly sub = new Subscription();

  constructor(private readonly injector: Injector) {
    effect(() => {
      if (this.article()?.id)
        fetchPreview(
          this.article()?.id ?? '',
          runInInjectionContext(this.injector, () => buildQuery())
        ).then((data: PreviewData) => {
          this.previewService.setPreviewData(data);
          this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + data?.documentCachedContentUrl));
        });
    }, { allowSignalWrites: true });

    this.sub.add(
      selectionStore.current$.subscribe((selection) => {
          if (selection !== null && this.article()?.id === selection?.id)
            this.previewService.setIframe(this.preview)
        })
    );

    this.sub.add(
      appStore.current$.subscribe(() => {
        this.labels = appStore.getLabels();
      })
    )
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
    if (this.article()?.id === undefined) return;

    const isBookmarked = await this.bookmarkService.isBookmarked(this.article()!.id!);

    if (isBookmarked)
      this.bookmarkService.unbookmark(this.article()!.id!);
    else
      this.bookmarkService.bookmark(this.article()! as Article);
  }
}

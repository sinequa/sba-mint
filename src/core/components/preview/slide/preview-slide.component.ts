import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Article as A, LegacyFilter } from '@sinequa/atomic';
import { AppStore, DropdownComponent, MetadataComponent, PreviewService, QueryParamsStore, SearchService, SplitPipe } from '@sinequa/atomic-angular';

import { BasePreview } from '@/core/registry/base-preview';

import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { PreviewActionsComponent } from '../actions/preview-actions';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'app-preview-slide',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    SlicePipe,
    SplitPipe,
    PreviewNavbarComponent,
    MetadataComponent,
    PreviewActionsComponent,
    SourceIconComponent,
    TranslocoPipe,
    DropdownComponent
  ],
  templateUrl: './preview-slide.component.html',
  host: {
    class: 'grow flex flex-col overflow-hidden'
  },
  styleUrl: './preview-slide.component.scss'
})
export class PreviewSlideComponent extends BasePreview implements OnDestroy {
  public iframe = viewChild<ElementRef<HTMLIFrameElement>>('preview');

  public readonly article = computed(() => this.previewData()?.record as Article);
  public readonly previewUrl = computed(() =>
    this.previewData()?.documentCachedContentUrl ?
      this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this.previewData().documentCachedContentUrl) :
      undefined
  );
  thumbnailFailed = signal(false);

  public labels = inject(AppStore).getLabels();

  public readonly hasLabels = computed(() => {
    const publicLabels = this.article()[this.labels.public];
    const privateLabels = this.article()[this.labels.private];
    return (publicLabels && publicLabels.length > 0) || (privateLabels && privateLabels.length > 0);
  });
  protected readonly locationSegments = computed(() => this.article().treepath[0]?.split('/')?.slice(1, -1));
  protected readonly queryParamStore = inject(QueryParamsStore);
  protected readonly searchService = inject(SearchService);
  protected readonly router = inject(Router);

  readonly headerCollapsed = signal<boolean>(false);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly previewService = inject(PreviewService);

  private readonly sub = new Subscription();

  constructor() {
    super();

    effect(() => {
      if (!this.iframe()) return;

      this.previewService.setIframe(this.iframe()!.nativeElement.contentWindow);
    });

    effect(() => {
      if (!this.previewData()) return;

      this.previewService.setPreviewData(this.previewData());
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  navigateToSegment(index: number): void {
    let currentFilter = this.queryParamStore.getFilterFromColumn('treepath');

    if (!currentFilter)
      currentFilter = { field: 'treepath', operator: 'in' } as LegacyFilter;

    if (!currentFilter.values)
      currentFilter.values = [];

    currentFilter.values.push(`/${this.locationSegments().slice(0, index + 1).join('/')}/*`);

    this.queryParamStore.updateFilter(currentFilter);

    const { filters } = getState(this.queryParamStore);

    this.router.navigate([], { queryParams: { f: JSON.stringify(filters) }, queryParamsHandling: 'merge' });
  }
}

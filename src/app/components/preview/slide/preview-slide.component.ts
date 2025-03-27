import { NgClass } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, OnDestroy, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Article as A, LegacyFilter, PreviewData } from '@sinequa/atomic';
import {
  AppStore,
  MetadataComponent,
  PreviewService,
  QueryParamsStore,
  SearchService,
  SourceComponent,
  TranslocoDateImpurePipe
} from '@sinequa/atomic-angular';
import { PopoverComponent, PopoverContentComponent } from '@sinequa/ui';

import { PreviewActionsComponent } from '../default/actions/preview-actions';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'app-preview-slide',
  standalone: true,
  imports: [
    NgClass,
    PreviewNavbarComponent,
    MetadataComponent,
    PreviewActionsComponent,
    SourceComponent,
    TranslocoPipe,
    TranslocoDateImpurePipe,
    PopoverComponent,
    PopoverContentComponent
  ],
  templateUrl: './preview-slide.component.html',
  host: {
    class: 'grow flex flex-col overflow-hidden'
  },
  styleUrl: './preview-slide.component.scss'
})
export class PreviewSlideComponent implements OnDestroy {
  public readonly previewData = input.required<PreviewData>();
  public iframe = viewChild<ElementRef<HTMLIFrameElement>>('preview');

  public readonly article = computed(() => this.previewData()?.record as Article);
  public readonly previewUrl = computed(() =>
    this.previewData()?.documentCachedContentUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this.previewData().documentCachedContentUrl)
      : undefined
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
  readonly canLoadIframe = signal<boolean>(false);
  readonly previewUrlError = signal<boolean>(false);

  private readonly sub = new Subscription();

  constructor() {
    effect(() => {
      if (!this.iframe()) return;

      this.previewService.setIframe(this.iframe()!.nativeElement.contentWindow);
    });

    effect(() => {
      if (!this.previewData()) return;

      this.previewService.setPreviewData(this.previewData());
    });

    effect(async () => {
      if (!this.previewUrl()) return;

      try {
        const response = await fetch(this.previewUrl() as string);
        const text = await response.text();
        this.canLoadIframe.set(true);
      } catch (e) {
        this.previewUrlError.set(true);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  navigateToSegment(index: number): void {
    let currentFilter = this.queryParamStore.getFilter('Treepath');

    if (!currentFilter) currentFilter = { field: 'treepath', operator: 'in' } as LegacyFilter;

    if (!currentFilter.values) currentFilter.values = [];

    currentFilter.values.push(
      `/${this.locationSegments()
        .slice(0, index + 1)
        .join('/')}/*`
    );

    this.queryParamStore.updateFilter(currentFilter);

    const { filters } = getState(this.queryParamStore);

    this.router.navigate([], { queryParams: { f: JSON.stringify(filters) }, queryParamsHandling: 'merge' });
  }

  /**
   * Apply filter from the metadata click
   * @param field field to filter on
   * @param value value from the filter
   */
  onMetadataClick({ field, value }: { field: string; value: string }): void {
    let filter: LegacyFilter = { field, value };
    this.queryParamStore.updateFilter(filter);
  }
}

import { DatePipe, NgClass } from '@angular/common';
import { Component, ElementRef, OnDestroy, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Article as A, LegacyFilter } from '@sinequa/atomic';
import { AppStore, DropdownComponent, MetadataComponent, PreviewService, QueryParamsStore, SearchService, SelectionStore } from '@sinequa/atomic-angular';

import { BasePreview } from '@/core/registry/base-preview';

import { TranslocoDateImpurePipe } from '@/core/pipes/transloco-date.pipe';
import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { PreviewActionsComponent } from '../actions/preview-actions';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'app-preview-default',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    PreviewNavbarComponent,
    MetadataComponent,
    PreviewActionsComponent,
    SourceIconComponent,
    TranslocoPipe,
    TranslocoDateImpurePipe,
    DropdownComponent,
  ],
  templateUrl: './preview-default.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'grow flex flex-col overflow-hidden'
  },
  styleUrl: './preview-default.component.scss'
})
export class PreviewDefaultComponent extends BasePreview implements OnDestroy {
  public iframe = viewChild<ElementRef<HTMLIFrameElement>>('preview');

  public readonly article = computed(() => this.previewData()?.record as Article);
  public readonly previewUrl = computed(() =>
    this.previewData()?.documentCachedContentUrl ?
      this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this.previewData().documentCachedContentUrl) :
      undefined
  );

  public labels = inject(AppStore).getLabels();

  public readonly hasLabels = computed(() => {
    const publicLabels = this.article()[this.labels.public];
    const privateLabels = this.article()[this.labels.private];
    return (publicLabels && publicLabels.length > 0) || (privateLabels && privateLabels.length > 0);
  });
  protected readonly locationSegments = computed(() => this.article().treepath[0]?.split('/')?.slice(1, -1));
  protected readonly queryParamStore = inject(QueryParamsStore);
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly searchService = inject(SearchService);
  protected readonly router = inject(Router);

  readonly headerCollapsed = signal<boolean>(false);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly previewService = inject(PreviewService);
  readonly canLoadIframe = signal<boolean>(false);
  readonly previewUrlError = signal<boolean>(false);

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
    });

    effect(async() => {
      if (!this.previewUrl()) return;

      try {
        const response = await fetch(this.previewUrl() as string);
        if (response.status === 200) {
          const text = await response.text();
          this.canLoadIframe.set(true);
        } else {
          this.previewUrlError.set(true)
        }
      } catch (e) {
        this.previewUrlError.set(true);
      }
    });
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

  /**
   * Handles the event when the preview component is loaded.
   *
   * This method retrieves the `previewHighlights` from the selection store state.
   * If `previewHighlights` contains a `snippetId`, it constructs a message with
   * the action 'select', the snippet ID, and a flag to use the passage highlighter.
   * The message is then sent to the preview service.
   */
  onLoaded() {
    const { previewHighlights } = getState(this.selectionStore);
    if (previewHighlights?.snippetId !== undefined) {
      const message: any = { action: 'select', id: `snippet_${previewHighlights!.snippetId}`, usePassageHighlighter: true };
      this.previewService.sendMessage(message);
    }
  }

  /**
   * Apply filter from the metadata click
   * @param field field to filter on
   * @param value value from the filter
   */
  onMetadataClick({field, value}:{field: string, value: string}): void {
    let filter: LegacyFilter = { field, value };
    this.queryParamStore.updateFilter(filter);
  }
}

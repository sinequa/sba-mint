import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Article as A, CCApp, LegacyFilter, PreviewData } from '@sinequa/atomic';
import {
  ApplicationStore,
  AppStore,
  DocumentLocatorComponent,
  MetadataComponent,
  PreviewService,
  QueryParamsStore,
  SearchService,
  SelectionStore,
  TranslocoDateImpurePipe
} from '@sinequa/atomic-angular';

import { PreviewActionsComponent } from './actions/preview-actions';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';
import { AssistantComponent } from '../../assistant/assistant';
import { cn } from '@sinequa/ui';

type Article = A & {
  [key: string]: string[] | undefined;
};

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`../i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'app-preview-default',
  standalone: true,
  providers: [provideTranslocoScope({ scope: 'preview', loader })],
  imports: [
    NgClass,
    PreviewNavbarComponent,
    MetadataComponent,
    PreviewActionsComponent,
    TranslocoPipe,
    TranslocoDateImpurePipe,
    DocumentLocatorComponent,
    AssistantComponent
  ],
  templateUrl: './preview-default.component.html',
  host: {
    class: 'grow flex flex-col overflow-hidden'
  },
  styleUrl: './preview-default.component.scss'
})
export class PreviewDefaultComponent {
  cn = cn;

  public readonly previewData = input.required<PreviewData>();
  public iframe = viewChild<ElementRef<HTMLIFrameElement>>('preview');

  public readonly article = computed(() => this.previewData()?.record as Article);
  public readonly previewUrl = computed(() =>
    this.previewData()?.documentCachedContentUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this.previewData().documentCachedContentUrl)
      : undefined
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
  protected readonly cdr = inject(ChangeDetectorRef);

  readonly headerCollapsed = signal<boolean>(false);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly previewService = inject(PreviewService);
  readonly canLoadIframe = signal<boolean>(false);
  readonly previewUrlError = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  appStore = inject(AppStore);
  applicationStore = inject(ApplicationStore);

  isStreaming = signal<boolean>(false);
  assistantCollapsed = signal<boolean>(true);
  showAssistant = signal<boolean>(false);

  displaySummary = computed(() => this.appStore.customizationJson()?.['assistants']?.[this.instanceId()]?.['defaultValues']?.['service_id']);

  readonly instanceId = computed(() => {
    const { name } = getState(this.appStore) as CCApp;
    return `${name}-mini-preview-assistant`;
  });

  constructor() {
    effect(() => {
      if (!this.iframe()) return;

      this.previewService.setIframe(this.iframe()!.nativeElement.contentWindow);
    });

    effect(() => {
      if (!this.previewData()) return;

      this.cdr.detectChanges();
      this.previewService.setPreviewData(this.previewData());
    });

    effect(
      async () => {
        if (!this.previewUrl()) return;

        try {
          this.loading.set(true);
          this.cdr.detectChanges();
          const response = await fetch(window.location.origin + this.previewData().documentCachedContentUrl);
          this.canLoadIframe.set(response.status === 200);
          this.previewUrlError.set(response.status !== 200);
        } catch (e) {
          this.canLoadIframe.set(false);
          this.previewUrlError.set(true);
        } finally {
          this.loading.set(false);
        }
      },
      { allowSignalWrites: true }
    );
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
    this.loading.set(false);
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

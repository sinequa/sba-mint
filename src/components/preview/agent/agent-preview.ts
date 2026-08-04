import { Component, computed, effect, inject, output, signal } from "@angular/core";
import { ConverterSelectComponent } from "@components/preview/converter-select/converter-select";
import { PreviewContentComponent } from "@components/preview/preview-content/preview-content";
import { PreviewHeaderComponent } from "@components/preview/preview-header/preview-header";
import { PreviewNavbarComponent } from "@components/preview/preview-navbar/preview-navbar";
import { Article as A, PreviewData } from "@sinequa/atomic";
import { CConverter, PreviewService, SelectionStore } from "@sinequa/atomic-angular";

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: "agent-preview",
  imports: [PreviewNavbarComponent, PreviewHeaderComponent, ConverterSelectComponent, PreviewContentComponent],
  template: `
    <div class="flex max-w-[inherit] flex-col size-full">
      <preview-navbar
        class="block border-b border-muted-foreground/18"
        [isPrimary]="!conversion() || conversion()!.primary === true || conversion()!.conversion?.isPrimary === true"
        [config]="{ showSearchButton: false }"
        [article]="article()"
        (onClose)="onClose.emit()" />

      <div class="@container relative flex h-full flex-col gap-0.5">
        @if (id()) {
          @if (article()) {
            <section class="relative hidden border-b border-muted-foreground/18 ps-6 pe-1 py-1 @min-md:block">
              <preview-header [article]="article()!" />
              <section class="absolute bottom-0 left-0 w-full overflow-hidden" [class.invisible]="!loading()">
                <div class="h-0.5 animate-progress bg-linear-to-r from-ai-from via-ai-via to-ai-to"></div>
              </section>
            </section>
          }
          <!-- multiformat (converter) dropdown only — no summary/discussion tabs in the agent -->
          <converter-select class="self-end pe-4 pt-1" [previewData]="previewData()" (onConversionSelect)="conversion.set($event)" />
          <preview-content class="h-full" [conversion]="conversion()" (onLoadedData)="previewData.set($event)" />
        } @else {
          <preview-content class="h-full" />
        }
      </div>
    </div>
  `
})
export class AgentPreview {
  previewService = inject(PreviewService);
  private readonly selectionStore = inject(SelectionStore);

  onClose = output();

  // The selection id drives the structural gate. In the agent, a document/reference is selected via
  // SelectionStore.update({ id }) WITHOUT an article (unlike the assistant, which also sets article),
  // so gating on `article` would hide the preview + converter dropdown. The id is set synchronously on
  // selection and stays set for the whole load, so <preview-content> mounts once and is never
  // destroyed/recreated mid-load — recreating it killed the in-flight preview and left an endless spinner.
  id = computed(() => this.selectionStore.id?.());

  // `article` is used only for the header/navbar. It is decoupled from the structural gate above so
  // that resolving it (undefined → record) never remounts <preview-content>. Since the selection often
  // carries no article in the agent, fall back to the loaded preview record.
  article = signal<Article | undefined>(undefined);

  // Loaded preview data (feeds the converter dropdown) and the currently selected converter.
  previewData = signal<PreviewData | undefined>(undefined);
  conversion = signal<CConverter | undefined>(undefined);

  loading = computed(() => !this.previewService.DOMContentLoaded());

  constructor() {
    effect(() => {
      const events = this.previewService.events();

      if (events === "loading") {
        this.article.set(undefined);
        this.previewData.set(undefined);
        this.conversion.set(undefined);
      }

      if (events === "loaded") {
        const record = (this.selectionStore.article?.() ?? this.previewService.previewData?.record) as Article;
        this.article.set(record);
      }
    });
  }
}

import { Component, computed, effect, inject, output, signal } from "@angular/core";
import { PreviewContentComponent } from "@components/preview/preview-content/preview-content";
import { PreviewHeaderComponent } from "@components/preview/preview-header/preview-header";
import { PreviewNavbarComponent } from "@components/preview/preview-navbar/preview-navbar";
import { Article as A } from "@sinequa/atomic";
import { CConverter, PreviewService } from "@sinequa/atomic-angular";

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: "agent-preview",
  imports: [PreviewNavbarComponent, PreviewHeaderComponent, PreviewContentComponent],
  template: `
    <div class="flex max-w-[inherit] flex-col size-full">
      <preview-navbar
        class="block border-b border-muted-foreground/18"
        [isPrimary]="!conversion() || conversion()!.primary === true || conversion()!.conversion?.isPrimary === true"
        [config]="{ showSearchButton: false }"
        [article]="article()"
        (onClose)="onClose.emit()" />

      <div class="@container relative mb-2 flex h-full flex-col gap-0.5">
        @if (article()) {
          <section class="relative hidden border-b border-muted-foreground/18 px-6 py-4 @min-lg:block">
            <preview-header [article]="article()!" />
            <section class="absolute bottom-0 left-0 w-full overflow-hidden" [class.invisible]="!loading()">
              <div class="h-0.5 animate-progress bg-linear-to-r from-ai-from via-ai-via to-ai-to"></div>
            </section>
          </section>
        }
        <preview-content class="h-full" />
      </div>
    </div>
  `
})
export class AgentPreview {
  previewService = inject(PreviewService);

  onClose = output();

  article = signal<Article | undefined>(undefined);
  conversion = signal<CConverter | undefined>(undefined);

  loading = computed(() => !this.previewService.DOMContentLoaded());

  constructor() {
    effect(() => {
      const events = this.previewService.events();

      if (events === "loading") {
        this.article.set(undefined);
      }

      if (events === "loaded") {
        const record = this.previewService.previewData?.record;
        this.article.set(record as Article);
      }
    });
  }
}

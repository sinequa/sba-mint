import { afterNextRender, Component, computed, DOCUMENT, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';

import { Article as A } from '@sinequa/atomic';
import { AdvancedSearch, ApplicationService, PreviewService, SelectionStore } from '@sinequa/atomic-angular';
import { cn, SheetService } from '@sinequa/ui';

import { PreviewHeaderComponent } from './preview-header/preview-header';
import { PreviewNavbarComponent } from './preview-navbar/preview-navbar';
import { PreviewTabsComponent } from './preview-tabs/preview-tabs';
import { EventManager } from '@angular/platform-browser';

type Article = A & {
  [key: string]: string[] | undefined;
};

/**
 * Preview component
 *
 * Usage:
 * ```html
 * <preview></preview>
 * ```
 * This component displays the preview of the selected article along with its navigation bar and tabs.
 * It also manages the extended view state for the preview.
 *
 */
@Component({
  selector: 'preview, Preview',
  providers: [provideTranslocoScope({ scope: 'preview' })],
  imports: [PreviewNavbarComponent, PreviewTabsComponent, PreviewHeaderComponent, AdvancedSearch],
  templateUrl: './preview.html',
  host: {
    '[class]': 'cn("w-full h-full grid transition-all ease-out duration-200", extended() ? "grid-cols-[1fr_.5fr]" : "grid-cols-[auto_0fr]")',
    tabindex: '1'
  }
})
export class PreviewComponent {
  cn = cn;

  protected readonly previewTabs = viewChild(PreviewTabsComponent);

  /* injectables */
  protected readonly selectionStore = inject(SelectionStore);
  protected readonly previewservice = inject(PreviewService);
  protected readonly applicationService = inject(ApplicationService);

  /* models used by inner components */
  protected readonly loading = computed(() => !this.previewservice.DOMContentLoaded());

  /* used to toggle the extended view when not displayed inside the drawer */
  protected readonly extended = signal(false);

  protected readonly article = computed(() => {
    const article = this.selectionStore.article?.();
    if (article) {
      this.applicationService.setTitle(article.title || 'Preview');
    }
    return article as Article;
  });

  eventManager = inject(EventManager);
  host = inject(ElementRef<HTMLElement>);
  document = inject(DOCUMENT);
  sheetService = inject(SheetService);

  constructor() {
    afterNextRender(() => {
      this.eventManager.addEventListener(this.document.body, 'keyup', (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.sheetService.setOpen(false);
        }
      });
    });

    // if the scrollTo event is emitted, set the active tab to preview if the active tab is not already preview
    effect(() => {
      const event = this.previewservice.events();

      // If the event is scrollTo, set the active tab to preview if it's not already
      if (event === 'scrollTo' && this.previewTabs()?.activeTabValue() !== 'preview') {
        this.previewTabs()?.setActiveTab('preview');
      }

      // If the event is scrollTo, set the events to idle to avoid multiple triggers
      if (event === 'scrollTo') {
        this.previewservice.events.set('idle');
      }
    });
  }
}

import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';

import { Article as A } from '@sinequa/atomic';
import { AdvancedSearchComponent, ApplicationService, PreviewService, SelectionStore } from '@sinequa/atomic-angular';
import { cn } from '@sinequa/ui';

import { PreviewNavbarComponent } from './navbar/navbar';
import { PreviewHeaderComponent } from './preview-header/preview-header';
import { PreviewTabsComponent } from './preview-tabs/preview-tabs';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'preview, Preview',
  providers: [provideTranslocoScope({ scope: 'preview' })],
  imports: [PreviewNavbarComponent, PreviewTabsComponent, PreviewHeaderComponent, AdvancedSearchComponent],
  templateUrl: './preview.html',
  host: {
    '[class]':
      'cn("grow w-full h-full overflow-hidden grid transition-all ease-out duration-200", extended() ? "grid-cols-[auto_400px]" : "grid-cols-[auto_0%]")'
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

  constructor() {
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

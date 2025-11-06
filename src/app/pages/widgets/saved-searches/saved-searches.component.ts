import { afterNextRender, ChangeDetectorRef, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { getQueryParamsFromUrl, notify } from '@sinequa/atomic';
import { ApplicationService, DrawerStackService, SavedSearchesService, SearchItem } from '@sinequa/atomic-angular';
import { ButtonComponent } from '@sinequa/ui';

@Component({
  selector: 'SavedSearches',
  imports: [TranslocoPipe, ButtonComponent],
  templateUrl: './saved-searches.component.html',
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class SavedSearchesComponent {
  cdr = inject(ChangeDetectorRef);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly transloco = inject(TranslocoService);

  private readonly router = inject(Router);
  private readonly savedSearchesService = inject(SavedSearchesService);
  readonly applicationService = inject(ApplicationService);

  readonly drawerOpened = computed(() => this.drawerStack.isOpened());
  protected readonly savedSearches = signal<SearchItem[]>([]);

  constructor() {
    afterNextRender(this.setTitle.bind(this));

    effect(() => {
      const savedSearches = this.savedSearchesService.getSavedSearches();

      this.savedSearches.set(
        (savedSearches || []).reduce((acc, savedSearch) => {
          const queryParams = getQueryParamsFromUrl(savedSearch.url);

          acc.push(
            Object.assign(savedSearch, {
              label: queryParams?.text || '',
              filterCount: queryParams?.filters?.length || 0,
              queryParams
            })
          );

          return acc;
        }, [] as SearchItem[])
      );
    });

    this.transloco.langChanges$.subscribe(this.setTitle.bind(this));
  }

  public onClick(savedSearch: SearchItem): void {
    const queryParams = {
      q: savedSearch.queryParams?.text
    } as { q: string; f?: string };

    if (savedSearch.queryParams?.filters && savedSearch.queryParams?.filters?.length > 0) queryParams.f = JSON.stringify(savedSearch.queryParams?.filters);

    this.router.navigate([savedSearch.queryParams?.path], { queryParams });
  }

  public async onDelete(event: Event, index: number) {
    event.stopPropagation();
    await this.savedSearchesService.deleteSavedSearch(index);
    notify.success(this.transloco.translate('searches.saved.deleted'), { duration: 2000 });
  }

  /**
   * Sets the page title to the translated "mySavedSearches" text.
   * Uses the transloco service to get the localized title and updates
   * the application title through the applicationService.
   * @private
   */
  private setTitle() {
    const title = this.transloco.translate('mySavedSearches');
    this.applicationService.setTitle(title);
  }
}

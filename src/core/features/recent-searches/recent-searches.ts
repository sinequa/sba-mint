import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { getRelativeDate } from '@sinequa/atomic';
import { RecentSearch, UserSettingsStore } from '@sinequa/atomic-angular';
import { ButtonComponent, HorizontalDividerComponent, PopoverContentComponent } from '@sinequa/ui';

import { RecentSearchComponent } from './recent-search';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

const RECENT_SEARCHES_ITEMS_PER_PAGE = 10;

@Component({
  selector: 'RecentSearches',
  standalone: true,
  imports: [RouterModule, TranslocoPipe, HorizontalDividerComponent, RecentSearchComponent, ButtonComponent],
  template: `
    <div class="p-2">
      @if (floating) {
        <label class="text-xl font-bold">Recent searches</label>
        <MenuSeparator />
      }
    </div>

    <ul class="flex max-h-[460px] flex-col overflow-auto px-2 pb-2" role="list" aria-label="Recent searches">
      @for (recentSearch of paginatedRecentSearches(); track $index) {
        <RecentSearch [recentSearch]="recentSearch" (remove)="remove($index, $event)" />
      } @empty {
        <li class="py-4 text-center text-neutral-500">
          {{ 'recentSearches.noRecentSearches' | transloco }}
        </li>
      }
    </ul>

    <div class="flex gap-2">
      @if (hasMore()) {
        <button variant="outline" [attr.title]="'loadMore' | transloco" (click)="loadMore($event)">
          {{ 'loadMore' | transloco }}
        </button>
      }

      <button variant="link" class="ml-auto" [attr.title]="'seeMore' | transloco" [routerLink]="['/recent-searches']">
        {{ 'seeMore' | transloco }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        ul {
          scrollbar-width: thin;
        }
      }
    `
  ],
  providers: [provideTranslocoScope({ scope: 'recent-searches', loader })]
})
export class RecentSearchesComponent {
  floating = inject(PopoverContentComponent, { skipSelf: true, optional: true });

  private readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly transloco = inject(TranslocoService);

  protected readonly range = signal<number>(RECENT_SEARCHES_ITEMS_PER_PAGE);
  protected readonly recentSearches = computed<RecentSearch[]>(() => this.userSettingsStore.recentSearches());
  protected readonly paginatedRecentSearches = computed<RecentSearch[]>(() => this.recentSearches().slice(0, this.range()));
  protected readonly hasMore = computed<boolean>(() => this.recentSearches().length > 0 && this.range() < this.recentSearches().length);

  protected readonly getRelativeDate = getRelativeDate;

  /**
   * Deletes a recent search item at the specified index.
   * @param index - The index of the item to delete.
   * @param e - The event object.
   */
  async remove(index: number, e: Event) {
    e.stopPropagation();
    await this.userSettingsStore.deleteRecentSearch(index);
    toast.success('Recent search deleted');
  }

  loadMore(e: Event) {
    e.stopPropagation();
    this.range.set(this.range() + RECENT_SEARCHES_ITEMS_PER_PAGE);
  }
}

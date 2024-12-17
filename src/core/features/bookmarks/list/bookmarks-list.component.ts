import { Component, computed, inject, signal } from '@angular/core';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { LegacyFilter, Query } from '@sinequa/atomic';
import { Bookmark, DrawerStackService, QueryService, UserSettingsStore } from '@sinequa/atomic-angular';

const BOOKMARKS_ITEMS_PER_PAGE = 5;

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-bookmarks-list',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './bookmarks-list.component.html',
  styleUrl: './bookmarks-list.component.scss',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'block overflow-auto max-h-[460px]'
  },
  providers: [provideTranslocoScope({ scope: 'bookmark', loader })]
})
export class BookmarksListComponent {
  private readonly drawerStack = inject(DrawerStackService);
  private readonly queryService = inject(QueryService);
  private readonly userSettingsStore = inject(UserSettingsStore);

  public range = signal<number>(BOOKMARKS_ITEMS_PER_PAGE);
  protected bookmarks = computed<Bookmark[]>(() => this.userSettingsStore.bookmarks());
  public paginatedBookmarks = computed<Bookmark[]>(() => this.bookmarks().slice(0, this.range()));
  public hasMore = computed<boolean>(() => this.bookmarks().length > 0 && this.range() < this.bookmarks().length);


  public onClick(bookmark: Bookmark): void {

    // if the bookmark was created before the queryName was added, don't try to open it
    if (!bookmark.queryName) {
      toast.warning('This bookmark is outdated and cannot be opened', { description: 'No query name!', duration: 2000 });
      return;
    }

    const query: Partial<Query> = {
      name: bookmark.queryName,
      filters: {
        field: "id",
        value: bookmark.id
      } as LegacyFilter
    }
    this.queryService.search(query, false).subscribe((result) => {
      if (!result.records || result.records.length === 0) {
        toast.warning('This bookmark is outdated and cannot be opened', { description: 'no record found!', duration: 2000 });
        return;
      }
      this.drawerStack.replace(result.records[0]);
    });
  }

  public onDelete(bookmark: Bookmark, e: Event) {
    e.stopPropagation();
    this.userSettingsStore.unbookmark(bookmark.id);
    toast.success('Bookmark removed', { duration: 2000 });
  }

  loadMore(e: Event) {
    e.stopPropagation();
    this.range.set(this.range() + BOOKMARKS_ITEMS_PER_PAGE);
  }
}
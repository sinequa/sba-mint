import { Component, computed, effect, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';

import { Query } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { UserSettingsStore } from '@/app/stores';
import { Bookmark } from '@/app/types/user-settings';

import { DrawerStackService } from '../../drawer-stack/drawer-stack.service';
import { SourceIconComponent } from '../../source-icon/source-icon.component';

const BOOKMARKS_ITEMS_PER_PAGE = 5;

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [SourceIconComponent],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'block overflow-auto max-h-[460px]'
  }
})
export class BookmarksComponent {
  private readonly drawerStack = inject(DrawerStackService);
  private readonly queryService = inject(QueryService);
  private readonly userSettingsStore = inject(UserSettingsStore);

  public range = signal<number>(BOOKMARKS_ITEMS_PER_PAGE);
  protected bookmarks = signal<Bookmark[]>([]);
  public paginatedBookmarks = computed<Bookmark[]>(() => this.bookmarks().slice(0, this.range()));
  public hasMore = computed<boolean>(() => this.bookmarks().length > 0 && this.range() < this.bookmarks().length);

  constructor() {
    effect(() => {
      const bookmarks = this.userSettingsStore.bookmarks();
      this.bookmarks.set(bookmarks);
    }, { allowSignalWrites: true });
  }

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
      }
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
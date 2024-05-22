import { Component, effect, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';

import { Query } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { UserSettingsStore } from '@/app/stores';
import { Bookmark } from '@/app/types/user-settings';

import { DrawerStackService } from '../../drawer-stack/drawer-stack.service';
import { SourceIconComponent } from '../../source-icon/source-icon.component';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [SourceIconComponent],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent {
  private readonly drawerStack = inject(DrawerStackService);
  private readonly queryService = inject(QueryService);
  private readonly userSettingsStore = inject(UserSettingsStore);

  protected bookmarks = signal<Bookmark[]>([]);


  constructor() {
    effect(() => {
      const bookmarks = this.userSettingsStore.bookmarks();
      this.bookmarks.set(bookmarks);
    }, { allowSignalWrites: true });
  }

  public onClick(bookmark: Bookmark): void {

    // if the bookmark was created before the queryName was added, don't try to open it
    if (!bookmark.queryName) return;

    const query: Partial<Query> = {
      name: bookmark.queryName,
      filters: {
        field: "id",
        value: bookmark.id
      }
    }
    this.queryService.search(query).subscribe((result) => {
      if (!result.records) return;
      this.drawerStack.replace(result.records[0]);
    });
  }

  public onDelete(bookmark: Bookmark, e: Event) {
    e.stopPropagation();
    this.userSettingsStore.unbookmark(bookmark.id);
    toast.success('Bookmark removed', { duration: 2000 });
  }
}
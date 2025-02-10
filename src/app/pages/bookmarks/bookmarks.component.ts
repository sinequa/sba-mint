import { getComponentsForDocumentType } from '@/app/registry/document-type-registry';
import { NavbarComponent } from '@/core/components/navbar/navbar.component';
import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, inject, signal, Type } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Article, LegacyFilter, Query } from '@sinequa/atomic';
import { Bookmark, DrawerStackService, QueryService, UserSettingsStore } from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';
import { firstValueFrom, Subscription } from 'rxjs';

interface BookmarkArticle {
  bookmark: Bookmark;
  article?: Article;
}

@Component({
  selector: 'Bookmarks',
  standalone: true,
  imports: [NavbarComponent, TranslocoPipe, NgComponentOutlet],
  templateUrl: './bookmarks.component.html'
})
export class BookmarksComponent {
  cdr = inject(ChangeDetectorRef);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly queryService = inject(QueryService);
  private readonly drawerStack = inject(DrawerStackService);

  protected bookmarks = computed<Bookmark[]>(() => this.userSettingsStore.bookmarks());
  protected bookmarksArticle = signal<BookmarkArticle[]>([]);
  readonly drawerOpened = signal(false);

  private readonly sub = new Subscription();

  constructor() {
    this.sub.add(this.drawerStack.isOpened.subscribe(state => this.drawerOpened.set(state)));

    effect(() => {
      if (this.bookmarks().length) {
        this.loadBookmarks();
      }
    });
  }

  public async loadBookmarks(): Promise<void> {
    const list: BookmarkArticle[] = [];
    this.bookmarks().forEach(async bookmark => {
      const query: Partial<Query> = {
        name: bookmark.queryName,
        filters: {
          field: 'id',
          value: bookmark.id
        } as LegacyFilter
      };
      const response = await firstValueFrom(this.queryService.search(query, false));
      const article = response.records[0];
      list.push({ bookmark, article });
      this.bookmarksArticle.set(list);
      this.cdr.detectChanges();
    });
  }

  getArticleType(docType: string): Type<unknown> {
    return getComponentsForDocumentType(docType).articleComponent;
  }

  public onDelete(bookmark: Bookmark) {
    this.userSettingsStore.unbookmark(bookmark.id);
    toast.success('Bookmark removed', { duration: 2000 });
  }
}

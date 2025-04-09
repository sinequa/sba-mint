import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, inject, signal, Type } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { firstValueFrom, Subscription } from 'rxjs';

import { Article, LegacyFilter, Query } from '@sinequa/atomic';
import { AppStore, Bookmark, DrawerStackService, QueryService, UserSettingsStore } from '@sinequa/atomic-angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { getComponentsForDocumentType } from '../../../registry/document-type-registry';
import { PageHeaderComponent } from '@sinequa/ui';

interface BookmarkArticle {
  bookmark: Bookmark;
  article?: Article;
}

@Component({
  selector: 'Bookmarks',
  standalone: true,
  imports: [NavbarComponent, TranslocoPipe, NgComponentOutlet, PageHeaderComponent],
  templateUrl: './bookmarks.component.html',
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class BookmarksComponent {
  cdr = inject(ChangeDetectorRef);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly queryService = inject(QueryService);
  private readonly drawerStack = inject(DrawerStackService);

  protected bookmarks = computed<Bookmark[]>(() => this.userSettingsStore.bookmarks());
  defaultQueryName = computed(() => this.appStore.getDefaultQuery()?.name || '_query');
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
    if (!this.bookmarks()) return;

    const list: BookmarkArticle[] = [];
    this.bookmarks().forEach(async bookmark => {
      const q = this.appStore.getQueryByName(bookmark.queryName || '');
      const name = !!q ? q.name : this.defaultQueryName();
      const query: Partial<Query> = {
        name,
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

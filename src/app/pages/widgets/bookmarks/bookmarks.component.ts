import { NgComponentOutlet } from '@angular/common';
import { BookmarkIcon, TrashCanIcon } from '@sinequa/ui';
import { afterNextRender, ChangeDetectorRef, Component, computed, effect, inject, signal, Type } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

import { Article, LegacyFilter, Query } from '@sinequa/atomic';
import { ApplicationService, AppStore, Bookmark, DrawerStackService, QueryService, UserSettingsStore } from '@sinequa/atomic-angular';

import { getComponentsForDocumentType } from '../../../registry/document-type-registry';

interface BookmarkArticle {
  bookmark: Bookmark;
  article?: Article;
}

/**
 * Component for displaying user bookmarks.
 * It retrieves bookmarks from the UserSettingsStore and displays them using
 * the appropriate article component based on the document type.
 * @deprecated This component is deprecated and will be removed in future versions.
 */
@Component({
  selector: 'Bookmarks',
  imports: [TranslocoPipe, NgComponentOutlet, BookmarkIcon, TrashCanIcon],
  templateUrl: './bookmarks.component.html',
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class BookmarksComponent {
  cdr = inject(ChangeDetectorRef);

  private readonly transloco = inject(TranslocoService);

  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly applicationService = inject(ApplicationService);
  private readonly queryService = inject(QueryService);
  private readonly drawerStack = inject(DrawerStackService);

  protected bookmarks = computed<Bookmark[]>(() => this.userSettingsStore.bookmarks());
  defaultQueryName = computed(() => this.appStore.getDefaultQuery()?.name || '_query');
  protected bookmarksArticle = signal<BookmarkArticle[]>([]);
  readonly drawerOpened = computed(() => this.drawerStack.isOpened());

  constructor() {
    afterNextRender(this.setTitle.bind(this));

    effect(() => {
      if (this.bookmarks().length) {
        this.loadBookmarks();
      }
    });

    // Set the page title when the drawer is closed
    effect(() => {
      if (!this.drawerOpened()) {
        this.applicationService.setTitle('Bookmarks');
      }
    });

    this.transloco.langChanges$.subscribe(this.setTitle.bind(this));
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

  /**
   * Sets the page title to the translated "mySavedSearches" text.
   * Uses the transloco service to get the localized title and updates
   * the application title through the applicationService.
   * @private
   */
  private setTitle() {
    const title = this.transloco.translate('myBookmarks');
    this.applicationService.setTitle(title);
  }
}

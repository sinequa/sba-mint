import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { ActivatedRoute } from '@angular/router';
import { Article } from '@sinequa/atomic';
import { cn, UserSettingsStore } from '@sinequa/atomic-angular';
import { StopPropagationDirective } from 'toolkit';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-bookmark-button',
  standalone: true,
  imports: [StopPropagationDirective, CommonModule, TranslocoPipe],
  templateUrl: './bookmark-button.component.html',
  providers: [provideTranslocoScope({ scope: 'bookmark', loader })]
})
export class BookmarkButtonComponent {
  public readonly article = input.required<Partial<Article>>();
  public readonly cn = cn;

  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly transloco = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);

  protected isBookmarked = computed(() => {
    return this.userSettingsStore.isBookmarked(this.article());
  })

  public async bookmark(e: Event) {
    e.stopPropagation();
    const isBookmarked = await this.userSettingsStore.isBookmarked(this.article());

    if (isBookmarked) {
      this.userSettingsStore.unbookmark(this.article()!.id!);
      toast.success(this.transloco.translate('bookmark.bookmarkRemoved'), { duration: 2000 });
    }
    else {
      const { queryName } = this.route.snapshot.data
      this.userSettingsStore.bookmark(this.article()! as Article, queryName);
      toast.success(this.transloco.translate('bookmark.bookmarkAdded'), { duration: 2000 });
    }
  }
}

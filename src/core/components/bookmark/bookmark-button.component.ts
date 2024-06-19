import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { cn } from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';

import { Article } from '@sinequa/atomic';

import { StopPropagationDirective } from 'toolkit';
import { UserSettingsStore } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-bookmark-button',
  standalone: true,
  imports: [StopPropagationDirective, CommonModule],
  templateUrl: './bookmark-button.component.html'
})
export class BookmarkButtonComponent {
  public readonly article = input.required<Partial<Article>>();
  public readonly cn = cn;

  private readonly userSettingsStore = inject(UserSettingsStore);


  protected isBookmarked = computed(() => {
    return this.userSettingsStore.isBookmarked(this.article());
  })

  public async bookmark(e: Event) {
    e.stopPropagation();
    const isBookmarked = await this.userSettingsStore.isBookmarked(this.article());

    if (isBookmarked){
      this.userSettingsStore.unbookmark(this.article()!.id!);
      toast.success('Article removed from bookmarks', { duration: 2000 });
    }
    else {
      this.userSettingsStore.bookmark(this.article()! as Article);
      toast.success('Article added to bookmarks', { duration: 2000 });
    }
  }
}

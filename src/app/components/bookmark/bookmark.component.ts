import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { cn } from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';
import { StopPropagationDirective } from 'toolkit';
import { UserSettingsStore } from '../../stores';
import { Article } from '../../types';

@Component({
  selector: 'app-bookmark',
  standalone: true,
  imports: [StopPropagationDirective, CommonModule],
  templateUrl: './bookmark.component.html'
})
export class BookmarkComponent {
  public readonly article = input.required<Partial<Article>>();
  public readonly cn = cn;

  private readonly userSettingsStore = inject(UserSettingsStore);


  protected isBookmarked = computed(() => {
    return this.article() ? this.userSettingsStore.isBookmarked(this.article()!.id!) : false;
  })

  public async bookmark(): Promise<void> {
    const isBookmarked = await this.userSettingsStore.isBookmarked(this.article()!.id!);

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

import { Component, computed, inject, input } from '@angular/core';
import { StopPropagationDirective } from 'toolkit';
import { UserSettingsStore } from '../../stores';
import { Article } from '../../types';

@Component({
  selector: 'app-bookmark',
  standalone: true,
  imports: [StopPropagationDirective],
  templateUrl: './bookmark.component.html'
})
export class BookmarkComponent {
  public readonly article = input.required<Partial<Article>>();

  private readonly userSettingsStore = inject(UserSettingsStore);


  protected isBookmarked = computed(() => {
    return this.article() ? this.userSettingsStore.isBookmarked(this.article()!.id!) : false;
  })

  public async bookmark(): Promise<void> {
    const isBookmarked = await this.userSettingsStore.isBookmarked(this.article()!.id!);

    if (isBookmarked)
      this.userSettingsStore.unbookmark(this.article()!.id!);
    else
      this.userSettingsStore.bookmark(this.article()! as Article);
  }
}

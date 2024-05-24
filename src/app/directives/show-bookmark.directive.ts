import { Directive, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';
import { Article } from '@sinequa/atomic';
import { UserSettingsStore } from '../stores';

@Directive({
  selector: '[appShowBookmark]',
  standalone: true
})
export class ShowBookmarkDirective {
  @HostListener('mouseenter')
  public mouseEnter(): void {
    this.bookmarkHovered.set(true);
  }

  @HostListener('mouseleave')
  public mouseLeave(): void {
    this.bookmarkHovered.set(false);
  }

  protected bookmarkHovered = signal(false);
  userSettingsStore = inject(UserSettingsStore);

  protected isBookmarked = computed(() => {
    return this.userSettingsStore.isBookmarked(this.article());
  });

  public readonly article = input.required<Article | Partial<Article> | undefined>();
  public readonly showBookmark = output<boolean>();

  constructor() {
    effect(() => {
      const bookmarkHovered = this.bookmarkHovered();
      const isBookmarked = this.isBookmarked();
      this.showBookmark.emit(bookmarkHovered || isBookmarked);
    });
  }

}

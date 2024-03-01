import { SelectionService } from '@/app/services/selection.service';
import { Directive, HostListener, inject, input } from '@angular/core';
import { DrawerStackService } from '@mint/components/drawer-stack/drawer-stack.service';
import { Article } from '@mint/types/articles/article.type';

export type SelectionStrategy = 'replace' | 'stack';

@Directive({
  selector: '[appSelectArticleOnClick]',
  standalone: true,
})
export class SelectArticleOnClickDirective {
  public readonly article = input.required<Article | Partial<Article> | undefined>();
  public readonly strategy = input<SelectionStrategy>('stack');

  @HostListener('click')
  public onClick(): void {
    if (!this.article()) return;

    switch (this.strategy()) {
      case 'replace':
        this.drawerStack.replace(this.article() as Article);
        break;
      case 'stack':
      default:
        this.drawerStack.stack(this.article() as Article);
        break;
    }
  }

  private readonly drawerStack = inject(DrawerStackService);
  private readonly selection = inject(SelectionService);
}

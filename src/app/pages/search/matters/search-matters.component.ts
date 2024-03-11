import { Component, HostBinding, effect, inject } from '@angular/core';

import { ArticleMatterComponent } from '@/app/components/article/matter/article-matter.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { Article } from "@/app/types/articles";

@Component({
  selector: 'app-search-matters',
  standalone: true,
  imports: [FiltersComponent, ArticleMatterComponent],
  templateUrl: './search-matters.component.html',
  styleUrl: './search-matters.component.scss',
})
export class SearchMattersComponent {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  public matters: Partial<Article>[] = [
    { value: '1', type: 'matter' },
    { value: '2', type: 'matter' },
    { value: '3', type: 'matter' },
    { value: '4', type: 'matter' },
    { value: '5', type: 'matter' }
  ];

  private readonly drawerStack = inject(DrawerStackService);

  private drawerEffect = effect(() => {
    this.drawerOpened = this.drawerStack.isOpened();
  });
}

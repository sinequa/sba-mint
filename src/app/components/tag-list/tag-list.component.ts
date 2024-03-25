import { Component, computed, input } from '@angular/core';

import { appStore } from '@/app/stores';
import { Article } from '@/app/types';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss'
})
export class TagListComponent {
  readonly article = input.required<Partial<Article> | undefined>();
  readonly source = computed(() => this.article()?.treepath?.[0]?.split('/')[1]);
  readonly tags = computed(() => this.getTags(this.source(), this.article()));

  private getTags(source: string | undefined, article: Partial<Article> | undefined): string[] {
    if (!source || !article) return [];

    const maps = appStore.getCustomizationJson()?.sourcesTagsMap;
    const map = maps?.find((map) => map.sources.includes(source));
    const tags = map?.tags?.reduce((acc, tag) => {
      const value = (article as Record<string, string>)?.[tag];

      if (value) acc.push(value);

      return acc;
    }, [] as string[]);

    return tags ?? [];
  }
}

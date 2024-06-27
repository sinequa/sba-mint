import { Component, computed, inject, input } from '@angular/core';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import { AppStore, SourceIconPipe } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-source-icon',
  standalone: true,
  imports: [TranslocoPipe, SourceIconPipe],
  templateUrl: './source-icon.component.html',
  providers: [provideTranslocoScope({ scope: 'source-icon', loader })]
})
export class SourceIconComponent {
  readonly collection = input<string[]>();

  private readonly appStore = inject(AppStore);

  readonly iconPath = computed(() => {
    const collections = this.collection();

    if (!collections) return undefined;

    const name = collections[0].split("/")[1];
    const sources = this.appStore.sources();
    const path = sources.find((source: { name: string }) => source.name === name)?.iconPath;

    return path;
  });
}

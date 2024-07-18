import { Component, computed, inject, input } from '@angular/core';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import { AppStore, CSources, SourceIconPipe } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-source-icon',
  standalone: true,
  imports: [TranslocoPipe, SourceIconPipe],
  templateUrl: './source-icon.component.html',
  providers: [provideTranslocoScope({ scope: 'sources', loader })]
})
export class SourceIconComponent {
  readonly collection = input<string[]>();
  readonly connector = input<string>('');

  private readonly appStore = inject(AppStore);

  readonly iconDetails = computed((): { iconClass: string, iconPath?: string } | undefined => {
    const [collection] = this.collection() || [];
    const connector = (this.connector() ?? '').toLocaleLowerCase();

    if (!collection) return undefined;

    const src = this.appStore.sources() as CSources;
    const name = collection.split("/")[1].toLocaleLowerCase();

    const defaultIconClass = "far fa-file";

    if(Array.isArray(src)) {
      const { icon: iconClass = defaultIconClass } = src.find((source: { name: string }) => source.name.toLocaleLowerCase() === name) || {};
      return ({ iconClass });
    }

    if(src.collection && Object.keys(src.collection as {}).includes(collection.toLocaleLowerCase())){
      const { iconClass = defaultIconClass, iconPath} = src?.collection?.[collection.toLocaleLowerCase()];
      return ({ iconClass, iconPath });
    }
    if(src.source && Object.keys(src.source as {}).includes(name)){
      const { iconClass = defaultIconClass, iconPath} = src?.source?.[name.toLocaleLowerCase()];
      return ({ iconClass, iconPath });
    }
    if(src.connector && Object.keys(src.connector as {}).includes(connector)){
      const { iconClass = defaultIconClass, iconPath} = src?.connector?.[connector.toLocaleLowerCase()];
      return ({ iconClass, iconPath });
    }

    return { iconClass: defaultIconClass };
  })
}

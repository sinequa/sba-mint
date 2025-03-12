import { Component } from '@angular/core';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'NoResultPanel',
  standalone: true,
  imports: [TranslocoPipe],
  providers: [provideTranslocoScope({ scope: 'noResult', loader })],
  template: `
    <header class="flex items-center gap-2 text-xl font-semibold">
      <i class="fa-fw far fa-face-sad-sweat text-3xl"></i>
      <p>{{ 'noResult.noResult' | transloco }}</p>
    </header>

    <p>{{ 'noResult.noResultSuggestion' | transloco }}</p>

    <hr />

    <p>{{ 'noResult.noResultAssistance' | transloco }}</p>
  `,
  host: {
    class: 'p-4 flex flex-col gap-2 bg-gray-100 rounded-md'
  }
})
export class NoResultPanelComponent {}

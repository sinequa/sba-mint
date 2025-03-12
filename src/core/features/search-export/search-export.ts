import { Component, inject, viewChild } from '@angular/core';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { CCApp } from '@sinequa/atomic';
import { AppStore, ExportQueryModel, QueryParamsStore, SearchService } from '@sinequa/atomic-angular';
import { ButtonComponent } from '@sinequa/ui';

import { ExportDialog } from './export-dialog';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'search-export',
  standalone: true,
  imports: [TranslocoPipe, ButtonComponent, ExportDialog],
  providers: [provideTranslocoScope({ scope: 'searchExport', loader })],
  templateUrl: './search-export.html'
})
export class SearchExportComponent {
  private appStore = inject(AppStore);
  readonly searchService = inject(SearchService);
  readonly queryParamsStore = inject(QueryParamsStore);

  readonly exportDialog = viewChild(ExportDialog);

  onExport() {
    this.exportDialog()?.showModal();
  }

  exportCsv(body: ExportQueryModel): void {
    const { name } = getState(this.appStore) as CCApp;
    const query = this.queryParamsStore.getQuery();

    this.searchService.download(body, name, query).subscribe();
  }
}

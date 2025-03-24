import { Component, DestroyRef, inject, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { CCApp, CCWebService, ExportOutputFormat } from '@sinequa/atomic';
import { AppStore, ExportQueryModel, QueryParamsStore, SearchService } from '@sinequa/atomic-angular';
import { ButtonComponent, DialogComponent, DialogContentComponent, DialogFooterComponent, DialogHeaderComponent, DialogTitleComponent } from '@sinequa/ui';

interface CCQueryExport extends CCWebService {
  webServiceType: 'queryexport';
  columns?: { column$: CCQueryExportColumnDef[] };
  linksFilterDuplicateUrls?: boolean;
  linksGlobalRelevance?: string;
  linksMaxCount?: number;
  linksSortByOrder?: boolean;
  maxCount?: number;
  separator?: string;
}

interface CCQueryExportColumnDef {
  title: string;
  pattern: string;
  selectionQuery?: string;
}

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'export-dialog',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoPipe,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent
  ],
  providers: [provideTranslocoScope({ scope: 'dialogExport', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'dialogExport.title' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent class="flex flex-col gap-2">
        <span>{{ 'dialogExport.outputFormat' | transloco }}</span>
        <select
          class="hover:outline-primary focus:outline-primary h-8 w-full rounded-md border border-gray-200 bg-neutral-50 px-2 hover:bg-white hover:outline focus:bg-white focus:outline"
          id="format"
          [ngModel]="format()"
          (ngModelChange)="format.set($event)">
          @for (format of supportedFormats; track $index) {
            <option [value]="format">{{ format.toUpperCase() }}</option>
          }
        </select>

        <span>{{ 'dialogExport.exportColumns' | transloco }}</span>
        <select
          id="exportedColumns"
          class="hover:outline-primary focus:outline-primary w-full rounded-md border border-gray-200 bg-neutral-50 px-2 hover:bg-white hover:outline focus:bg-white focus:outline"
          multiple
          [ngModel]="columnsToExport()"
          (ngModelChange)="columnsToExport.set($event)">
          @for (column of exportableColumns; track $index) {
            <option [value]="column">{{ column }}</option>
          }
        </select>

        <span>{{ 'dialogExport.maxLines' | transloco }}</span>
        <input
          type="number"
          id="maxCount"
          autocomplete="off"
          spellcheck="off"
          class="hover:outline-primary focus:outline-primary h-8 w-full rounded-md border border-gray-200 bg-neutral-50 px-2 hover:bg-white hover:outline focus:bg-white focus:outline"
          [ngModel]="maxCount()"
          (ngModelChange)="maxCount.set($event)" />
      </DialogContent>

      <DialogFooter>
        <button variant="outline" (click)="dialog.close()">
          {{ 'cancel' | transloco }}
        </button>
        <button tabindex="0" [attr.title]="'dialogExport.download' | transloco" (click)="onDownload()">
          {{ 'dialogExport.download' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class ExportDialog {
  onExport = output<ExportQueryModel>();

  private appStore = inject(AppStore);
  readonly searchService = inject(SearchService);
  readonly queryParamsStore = inject(QueryParamsStore);

  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  public exportableColumns: string[] = [];
  public readonly supportedFormats: ExportOutputFormat[] = ['Csv', 'Xlsx', 'Json'];

  public format = signal<ExportOutputFormat>('Csv');
  public maxCount = signal<number | undefined>(undefined);
  public columnsToExport = signal<string[]>([]);

  private webService: string;
  private destroyRef = inject(DestroyRef);

  showModal() {
    const app = getState(this.appStore) as CCApp;

    this.webService = app.queryExport;
    let queryExport: CCQueryExport;

    if (this.webService) {
      queryExport = app.webServices[this.webService] as CCQueryExport;

      if (queryExport) {
        const columns = queryExport.columns?.column$ || [];
        for (const column of columns) {
          this.exportableColumns.push(column.title);
        }
        if (queryExport.maxCount && typeof queryExport.maxCount === 'number') {
          this.maxCount.set(queryExport.maxCount);
        }
      }
    }

    setTimeout(() => {
      this.dialog()!.showModal();
    });
  }

  onDownload() {
    const model: ExportQueryModel = {
      format: this.format(),
      export: 'Result',
      maxCount: this.maxCount() && this.maxCount()! > 0 ? this.maxCount() : undefined,
      exportedColumns: this.columnsToExport().length ? this.columnsToExport() : undefined,
      webService: this.webService
    };

    const { name } = getState(this.appStore) as CCApp;
    const query = this.queryParamsStore.getQuery();

    this.searchService.download({ model, appName: name, query }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.dialog()!.close();
  }
}

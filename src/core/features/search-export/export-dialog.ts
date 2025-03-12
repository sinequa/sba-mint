import { Component, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { CCApp, CCWebService, ExportOutputFormat } from '@sinequa/atomic';
import {
  AppStore,
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  ExportQueryModel
} from '@sinequa/atomic-angular';

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
  providers: [provideTranslocoScope({ scope: 'searchExport', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'searchExport.export' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <div class="flex flex-col">
          <span>{{ 'searchExport.outputFormat' | transloco }}</span>
          <select class="rounded bg-neutral-50 p-2" id="format" [ngModel]="format()" (ngModelChange)="format.set($event)">
            @for (format of supportedFormats; track $index) {
              <option [value]="format">{{ format.toUpperCase() }}</option>
            }
          </select>

          <span>{{ 'searchExport.exportColumns' | transloco }}</span>
          <select id="exportedColumns" class="rounded bg-neutral-50 p-2" multiple [ngModel]="columnsToExport()" (ngModelChange)="columnsToExport.set($event)">
            @for (column of exportableColumns; track $index) {
              <option [value]="column">{{ column }}</option>
            }
          </select>

          <span>{{ 'searchExport.maxLines' | transloco }}</span>
          <input
            type="number"
            id="maxCount"
            autocomplete="off"
            spellcheck="off"
            class="grow rounded border border-neutral-200 p-2 focus:outline-none group-hover:bg-white"
            [ngModel]="maxCount()"
            (ngModelChange)="maxCount.set($event)" />
        </div>
      </DialogContent>

      <DialogFooter>
        <button variant="outline" (click)="dialog.close()">
          {{ 'collection.cancel' | transloco }}
        </button>
        <button class="w-full" tabindex="0" [attr.title]="'collection.download' | transloco" (click)="onDownload()">
          {{ 'searchExport.download' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class ExportDialog {
  onExport = output<ExportQueryModel>();

  private appStore = inject(AppStore);
  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  public exportableColumns: string[] = [];
  public readonly supportedFormats: ExportOutputFormat[] = ['Csv', 'Xlsx', 'Json'];

  public format = signal<ExportOutputFormat>('Csv');
  public maxCount = signal<number | undefined>(undefined);
  public columnsToExport = signal<string[]>([]);

  private webService: string;

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
    this.onExport.emit({
      format: this.format(),
      export: 'Result',
      maxCount: this.maxCount() && this.maxCount()! > 0 ? this.maxCount() : undefined,
      exportedColumns: this.columnsToExport().length ? this.columnsToExport() : undefined,
      webService: this.webService
    });

    this.dialog()!.close();
  }
}

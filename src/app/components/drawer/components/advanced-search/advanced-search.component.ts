import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getState } from '@ngrx/signals';

import { MetadataComponent, ReplacePipe } from '@sinequa/atomic-angular';

import { MockDataService } from '@/app/services';
import { PreviewService } from '@/app/services/preview';
import { AppStore, SelectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { ApplicationStore, Extract } from '@/stores';

import { PanelDirective } from 'toolkit';

@Component({
    selector: 'app-advanced-search',
    standalone: true,
    templateUrl: './advanced-search.component.html',
    styleUrl: './advanced-search.component.scss',
    // eslint-disable-next-line @angular-eslint/no-host-metadata-property
    host: {
      class: 'border-l border-neutral-300 bg-white'
    },
    imports: [NgTemplateOutlet, FormsModule, PanelDirective, ReplacePipe, MetadataComponent]
})
export class AdvancedSearchComponent {

  extracts = computed(() => {
    getState(this.applicationStore);
    if(!this.article()) return [];
    return this.applicationStore.getExtracts(this.article()!.id)
  });
  applicationStore = inject(ApplicationStore);
  selectionStore = inject(SelectionStore);

  readonly article = input.required<Article | undefined>();

  protected readonly input = signal(getState(this.selectionStore).queryText || '');

  public labels = inject(AppStore).getLabels();
  protected readonly people = inject(MockDataService).people;

  previewService = inject(PreviewService);


  constructor() { }

  protected executeSearch(): void {
    this.applicationStore.updateExtracts(this.article()!.id, []);
    this.selectionStore.updateQueryText(this.input());
  }

  protected clearInput(): void {
    this.input.set('');
  }

  scrollTo(extract: Extract) {
    this.previewService.sendMessage({ action: 'select', id: extract.id, usePassageHighlighter: false });
  }
}

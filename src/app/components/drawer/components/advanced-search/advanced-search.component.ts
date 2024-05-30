import { NgTemplateOutlet } from '@angular/common';
import { Component, WritableSignal, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getState } from '@ngrx/signals';

import { MetadataComponent, ReplacePipe } from '@sinequa/atomic-angular';

import { MockDataService } from '@/app/services';
import { PreviewService } from '@/app/services/preview';
import { AppStore, SelectionStore } from '@/app/stores';
import { Article, ArticleMetadata } from "@/app/types/articles";
import { ApplicationStore } from '@/stores';

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
    if (!this.article()) return [];
    return this.applicationStore.getExtracts(this.article()!.id)
  });
  applicationStore = inject(ApplicationStore);
  selectionStore = inject(SelectionStore);

  readonly article = input.required<Article | undefined>();

  protected readonly input = signal(getState(this.selectionStore).queryText || '');

  public geoIndex = signal<number>(0);
  public companyIndex = signal<number>(0);
  public personIndex = signal<number>(0);

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

  scrollTo(type: string, index: number, usePassageHighlighter: boolean = false) {
    this.previewService.sendMessage({ action: 'select', id: `${type}_${index}`, usePassageHighlighter });
  }

  navigateNext(scrollType: string, navigationIndex: WritableSignal<number>, metadata: ArticleMetadata[]) {
    if (navigationIndex() < metadata.length) navigationIndex.set(navigationIndex() + 1);
    else navigationIndex.set(1);
    this.scrollTo(scrollType, navigationIndex() - 1);
  }

  navigatePrev(scrollType: string, navigationIndex: WritableSignal<number>, metadata: ArticleMetadata[]) {
    if (navigationIndex() <= 1) navigationIndex.set(metadata.length);
    else if (navigationIndex() > 1) navigationIndex.set(navigationIndex() - 1);
    this.scrollTo(scrollType, navigationIndex() - 1);
  }
}

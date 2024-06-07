import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getState } from '@ngrx/signals';

import { MetadataComponent, ReplacePipe } from '@sinequa/atomic-angular';

import { PreviewService } from '@/app/services/preview';
import { AppStore, ApplicationStore, Extract, SelectionStore } from '@/app/stores';
import { Article, ArticleMetadata } from "@/app/types/articles";

import { PanelDirective } from 'toolkit';

interface MetadataNavigation {
  index: number;
  value: string;
}

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

  public navigation = signal<MetadataNavigation | undefined>(undefined);
  public hovering = signal<string | undefined>(undefined);
  public hoverIndex = computed(() => this.navigation()?.value === this.hovering() ? this.navigation()!.index : 0);

  public labels = inject(AppStore).getLabels();

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

  navigateNext(entity: string, data: ArticleMetadata) {
    const index = this.navigation()?.value === data.value
      ? this.navigation()!.index < data.count! ? this.navigation()!.index + 1 : 1
      : 1;

    this.navigation.set({
      value: data.value,
      index
    });

    const id = this.previewService.getEntityId(entity, data.value, index - 1);
    if (id !== undefined) {
      this.scrollTo(entity, id);
    }
  }

  navigatePrev(entity: string, data: ArticleMetadata) {
    const index = this.navigation()?.value === data.value
      ? this.navigation()!.index <= 1 ? data.count! : this.navigation()!.index - 1
      : data.count!;

    this.navigation.set({
      value: data.value,
      index
    });

    const id = this.previewService.getEntityId(entity, data.value, index - 1);
    if (id !== undefined) {
      this.scrollTo(entity, id);
    }
  }
}

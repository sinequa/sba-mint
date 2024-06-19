import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getState } from '@ngrx/signals';

import { Article } from '@sinequa/atomic';
import { MetadataComponent, ReplacePipe } from '@sinequa/atomic-angular';

import { ArticleMetadata } from '@sinequa/atomic-angular';
import { PreviewService } from '@sinequa/atomic-angular';
import { AppStore, ApplicationStore, SelectionStore } from '@sinequa/atomic-angular';



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
  public readonly article = input<Article | undefined>();
  public readonly textChanged = output<string>();

  public readonly labels = inject(AppStore).getLabels();
  private readonly applicationStore = inject(ApplicationStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly previewService = inject(PreviewService);

  protected readonly input = signal(getState(this.selectionStore).queryText || '');
  protected readonly extracts = computed(() => {
    getState(this.applicationStore);

    if (!this.article()) return [];

    return this.applicationStore.getExtracts(this.article()!.id)
  });

  public navigation = signal<MetadataNavigation | undefined>(undefined);
  public hovering = signal<string | undefined>(undefined);
  public hoverIndex = computed(() => this.navigation()?.value === this.hovering() ? this.navigation()!.index : 0);


  protected executeSearch(): void {
    this.textChanged.emit(this.input());
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

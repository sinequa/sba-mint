import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

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
    imports: [NgTemplateOutlet, FormsModule, PanelDirective, ReplacePipe, MetadataComponent]
})
export class AdvancedSearchComponent implements OnDestroy {
  @Output() public readonly search = new EventEmitter<string>();

  extracts = signal<Extract[]>([]);
  applicationStore = inject(ApplicationStore);
  selectionStore = inject(SelectionStore);
  cdr = inject(ChangeDetectorRef);

  readonly article = input<Partial<Article> | undefined>();

  protected readonly input = signal('');

  public labels = inject(AppStore).getLabels();
  protected readonly people = inject(MockDataService).people;

  previewService = inject(PreviewService);

  sub = new Subscription();

  constructor() {
    effect(() => {
      const {id} = getState(this.selectionStore);
      if (id) {
        const extracts = this.applicationStore.getExtracts(id)
        this.extracts.set(extracts ?? []);
      } else {
        this.extracts.set([]);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      getState(this.applicationStore);
      const {id} = getState(this.selectionStore);

      if (id) {
        const extracts = this.applicationStore.getExtracts(id);
        this.extracts.set(extracts || []);
      }
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  protected executeSearch(): void {
    this.search.emit(this.input());
  }

  protected clearInput(): void {
    this.input.set('');
    this.search.emit(this.input());
  }

  scrollTo(extract: Extract) {
    this.previewService.sendMessage({ action: 'select', id: `extractslocations_${extract.textIndex}`, usePassageHighlighter: true });
  }
}

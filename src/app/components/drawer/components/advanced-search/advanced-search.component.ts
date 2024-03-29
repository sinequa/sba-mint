import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { ReplacePipe } from '@sinequa/atomic-angular';

import { MockDataService } from '@/app/services';
import { PreviewService } from '@/app/services/preview';
import { appStore, selectionStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { ApplicationStore, Extract } from '@/stores';

import { PanelDirective } from 'toolkit';
import { MetadataComponent } from "../../../metadata/metadata.component";

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
  store = inject(ApplicationStore);
  cdr = inject(ChangeDetectorRef);

  readonly article = input<Partial<Article> | undefined>();

  protected readonly input = signal('');

  public labels = {public: '', private: ''};
  protected readonly people = inject(MockDataService).people;

  previewService = inject(PreviewService);

  sub = new Subscription();

  constructor() {
    this.sub.add(selectionStore.current$.subscribe((selection) => {
      if (selection && selection.id) {
        const extracts = this.store.getExtracts(selection.id)
        this.extracts.set(extracts ?? []);
      } else {
        this.extracts.set([]);
      }
    }));

    this.sub.add(
      appStore.current$.subscribe(() => {
        this.labels = appStore.getLabels();
      })
    )


    effect(() => {
      getState(this.store);
      const id = selectionStore.state?.id;

      if (id) {
        const extracts = this.store.getExtracts(id);
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

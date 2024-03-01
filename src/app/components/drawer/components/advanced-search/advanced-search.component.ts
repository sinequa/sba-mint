import { MockDataService } from '@/app/services/mock-data.service';
import { PreviewService } from '@/app/services/preview/preview.service';
import { selectionStore } from '@/app/stores/selection.store';
import { Extract } from '@/stores/app.state';
import { AppStore } from '@/stores/app.store';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Article } from '@mint/types/articles/article.type';
import { getState } from '@ngrx/signals';
import { ReplacePipe } from '@sinequa/atomic-angular';
import { Subscription } from 'rxjs';
import { PanelDirective } from 'toolkit';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, PanelDirective, ReplacePipe],
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.scss'
})
export class AdvancedSearchComponent implements OnDestroy {
  @Output() public readonly close = new EventEmitter<void>();
  @Output() public readonly search = new EventEmitter<string>();


  extracts = signal<Extract[]>([]);
  store = inject(AppStore);
  cdr = inject(ChangeDetectorRef);

  readonly article = input<Partial<Article> | undefined>();

  protected readonly input = signal('');

  protected readonly labels = inject(MockDataService).labels;
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

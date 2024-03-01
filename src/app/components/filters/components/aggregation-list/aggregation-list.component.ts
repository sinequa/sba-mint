import { AggregationsService } from '@/app/services/aggregations.service';
import { CustomizationService } from '@/app/services/customization.service';
import { Filter } from '@/app/utils/api-filter-translator';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AggregationItem } from '@sinequa/atomic';
import { Subscription, take, tap } from 'rxjs';
import { filtersStore } from '../../../../stores/filters.store';

export type AggregationListItem = {
  label: string;
  checked?: boolean;
  iconClass?: string;
};

export type AggregationListTitle = {
  label: string;
  iconClass?: string;
};

@Component({
  selector: 'app-aggregation-list-filter',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './aggregation-list.component.html',
  styleUrl: './aggregation-list.component.scss'
})
export class AggregationListFilterComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public column!: string;
  @Input({ required: false }) public title!: AggregationListTitle | undefined;

  @Output() public readonly refreshed = new EventEmitter<Filter>();
  @Output() public readonly updated = new EventEmitter<Filter>();
  @Output() public readonly valueChanged = new EventEmitter<Filter>();

  protected readonly aggregationItems = signal<AggregationListItem[]>([]);
  protected readonly hasFilter = computed(() => this.activeFilters().length > 0);
  protected readonly form = new FormArray<FormControl<boolean | null>>([]);

  private readonly customizationService = inject(CustomizationService);
  private readonly aggregationsService = inject(AggregationsService);
  private readonly activeFilters = signal<string[]>([]);
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    const updateState$ = filtersStore.current$
      .pipe(
        tap((filters) => {
          const aggregationItems = this.buildAggregationItems() ?? [];

          this.aggregationItems.set(aggregationItems);
          this.activeFilters.set(filters?.find((f: Filter) => f.column === this.column)?.values ?? []);
          this.buildForm(aggregationItems, filters?.find((f: Filter) => f.column === this.column)?.values ?? []);
        })
      );
    const initialized$ = updateState$.pipe(
      take(1)
    );

    this.subscriptions.add(
      updateState$.subscribe(() => {
        this.refreshed.emit({ column: this.column, label: this.getFilters()[0], values: this.getFilters() });
      })
    );
    this.subscriptions.add(
      initialized$.subscribe(() => {
        this.refreshed.emit({ column: this.column, label: this.getFilters()[0], values: this.getFilters() });
      })
    );
    this.subscriptions.add(
      this.form.valueChanges.subscribe((values) => {
        const current = values
          .map(x => x ? true : false)
          .reduce((acc: string[], value: boolean, index: number) => {
            if (value) acc.push(this.aggregationItems()[index].label);
            return acc;
          }, []);

        this.activeFilters.set(current);
        this.valueChanged.emit({ column: this.column, label: current[0], values: current });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public submit(): void {
    const filters = this.form.controls.reduce((acc: string[], control: FormControl, index: number) => {
      if (control.value) acc.push(this.aggregationItems()[index].label);

      return acc;
    }, []);

    this.updated.emit({ column: this.column, label: filters[0], values: filters });
  }

  public getFilters(): string[] {
    return this.activeFilters();
  }

  public clearFilters(notifyAsUpdated: boolean = true): void {
    this.form.controls.forEach(control => control.setValue(false, { emitEvent: false }));
    this.form.updateValueAndValidity();

    if (notifyAsUpdated) this.updated.emit({ column: this.column, label: undefined, values: [] });
  }

  private buildAggregationItems(): AggregationListItem[] {
    const itemCustomizations = this.customizationService.getAggregationItemsCustomization(this.column);
    const items = this.aggregationsService.getAggregationItems(this.column)
      ?.map((value: AggregationItem) => ({
        label: value.value,
        iconClass: itemCustomizations?.find((item) => item.value === value.value)?.iconClass
      })) as AggregationListItem[];

    return items;
  }

  private buildForm(aggregationItems: AggregationListItem[], filters: string[]): void {
    if (this.form.controls.length > 0) this.form.clear();

    aggregationItems.forEach((item: AggregationListItem) =>
      this.form.push(new FormControl(filters?.includes(item.label) ?? false), { emitEvent: false })
    );
    this.form.updateValueAndValidity();
  }
}

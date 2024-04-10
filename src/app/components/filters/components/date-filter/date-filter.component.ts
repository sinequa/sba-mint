import { NgClass } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output, computed, effect, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DateFilter, DateFilterCode } from '@/app/services';
import { Filter } from '@/app/utils/models';

import { QueryParamsStore } from '@/app/stores';
import { AggregationsStore } from '@/stores';
import { getState } from '@ngrx/signals';
import { Aggregation, FilterOperator } from '@sinequa/atomic';
import { AggregationTitle } from '../aggregation/aggregation.component';

const ALLOW_CUSTOM_RANGE = true;

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.scss'
})
export class DateFilterComponent implements OnDestroy {
  column = input.required<string>();
  title = input<AggregationTitle>({label: 'Date', icon: 'fas fa-calendar'});

  @Output() public readonly refreshed = new EventEmitter<Filter>();
  @Output() public readonly updated = new EventEmitter<Filter>();
  @Output() public readonly valueChanged = new EventEmitter<Filter>();

  readonly allowCustomRange = ALLOW_CUSTOM_RANGE;

  readonly dateOptions = computed(() => this.translateAggregationToDateOptions(this.aggregationsStore.getAggregation('Modified', 'name') as Aggregation));
  readonly hasFilter = computed(() => this.activeFilters().length > 0);

  readonly form = new FormGroup({
    option: new FormControl<DateFilterCode | string | null>(null),
    customRange: new FormGroup({
      from: new FormControl<string | null>(null),
      to: new FormControl<string | null>(null)
    })
  });
  protected today = new Date().toISOString().split('T')[0];

  private readonly activeFilters = computed(() => {
    const {filters} = getState(this.queryParamsStore);
    if(filters) {
      return filters.find((f: Filter) => f.column === this.column())?.values ?? [];
    }
    return [];
  });
  private readonly subscriptions = new Subscription();

  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly aggregationsStore = inject(AggregationsStore);

  constructor() {

    effect(() => {
      const {filters = []} = getState(this.queryParamsStore);
      console.log('## filters', filters, this.column);
      this.updateForm( filters.find((f: Filter) => f.column === this.column()));
      // this.refreshed.emit({ column: this.column, label: this.getLabel(), values: this.getFilters() });
    })

    this.subscriptions.add(
      this.form.valueChanges.subscribe((values) => {
        const current = [values.option?.toString() ?? '', values.customRange?.from ?? '', values.customRange?.to ?? ''];

        if (current.filter((value: string) => value === '').length === 3) current.length = 0;

        console.log("## current", current);
        // this.activeFilters.set(current);
        this.valueChanged.emit({ column: this.column(), label: this.getLabel(), values: current });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public submit(): void {
    const value = this.form.value;
    const dateOption = this.dateOptions().find((option: DateFilter) => option.display === value.option);
    const filter: Filter = {
      column: this.column(),
      label: value.option as string,
      values: [],
      operator: value.option === 'custom-range' ? 'between' : dateOption?.operator as FilterOperator
    };

    if (value.option !== 'custom-range')
      filter.values = [dateOption?.value ?? ''];
    else {
      filter.values = [
        value.customRange?.from ?? '',
        value.customRange?.to ?? ''
      ];
    }

    this.updated.emit(filter);
  }

  private getLabel(): string {
    return this.dateOptions().find(f => f.code === this.activeFilters()[0])?.label ?? '';
  }

  public clearFilters(notifyAsUpdated: boolean = true): void {
    this.form.setValue({
      option: null,
      customRange: {
        from: null,
        to: null
      }
    })

    if (notifyAsUpdated) this.updated.emit({ column: this.column(), label: undefined, values: [] });
  }

  protected forceFilterToCustomRange(): void {
    this.form.get('option')?.setValue('custom-range');
  }

  private translateAggregationToDateOptions(aggregation: Aggregation): DateFilter[] {
    console.log('#', aggregation);
    if (!aggregation?.items || aggregation?.items?.length === 0)
      return [];

    const items = aggregation.items;

    console.log('## items', items);

    const arr = items.reduce((acc, curr) => {
      const value = this.parseValueAndOperatorFromItem(curr.value as string);

      acc.push({
        operator: value[0],
        value: value[1],
        display: curr.display
      });

      return acc;
    }, [] as DateFilter[]);

    console.log('## arr', arr);

    return arr;
  }

  private parseValueAndOperatorFromItem(value: string): [string, string] {
    const skimmed = value.split(':')[1];
    // eslint-disable-next-line prefer-const
    let [operator, valueStr] = skimmed.split(' ');

    switch (operator) {
      case '>=': operator = 'ge'; break;
      case '<=': operator = 'le'; break;
      case '>': operator = 'gt'; break;
      case '<': operator = 'lt'; break;
      case '=': operator = 'eq'; break;
    }

    return [operator, valueStr];
  }

  private updateForm(filter: Filter | undefined): void {
    if (!filter) {
      this.clearFilters(false);
      return;
    }

    const [code, from, to] = filter.values;

    const formValue = {
      option: code as DateFilterCode ?? null,
      customRange: {
        from: (code === 'custom-range') ? from ?? null : null,
        to: (code === 'custom-range') ? to ?? null : null
      }
    };

    this.form.setValue(formValue);
  }
}

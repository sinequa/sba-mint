import { NgClass } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HashMap, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { Aggregation, FilterOperator } from '@sinequa/atomic';
import { AggregationEx, DateFilter, Filter, QueryParamsStore, cn } from '@sinequa/atomic-angular';

import { AggregationTitle } from '../aggregation/aggregation.component';

const ALLOW_CUSTOM_RANGE = true;

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.scss'
})
export class DateFilterComponent implements OnDestroy {
  cn = cn;
  aggregation = input.required<AggregationEx>();
  title = input<AggregationTitle>({ label: 'Date', icon: 'fas fa-calendar' });

  @Output() public readonly refreshed = new EventEmitter<Filter>();
  @Output() public readonly updated = new EventEmitter<Filter>();
  @Output() public readonly valueChanged = new EventEmitter<Filter>();

  readonly allowCustomRange = ALLOW_CUSTOM_RANGE;

  private readonly queryParamsStore = inject(QueryParamsStore);

  readonly dateOptions = computed(() => this.translateAggregationToDateOptions(this.aggregation()));

  readonly column = computed(() => this.aggregation().column);

  readonly hasAppliedFilter = computed(() => {
    return this.column() ? !!this.queryParamsStore.getFilterFromColumn(this.column()) : false;
  });

  readonly form = new FormGroup({
    option: new FormControl<string | null>(null),
    customRange: new FormGroup({
      from: new FormControl<string | null>(null),
      to: new FormControl<string | null>(null)
    })
  });
  protected today = new Date().toISOString().split('T')[0];


  private readonly subscriptions = new Subscription();

  hasDateFilter = signal<boolean>(false);

  constructor() {

    effect(() => {
      const filters = this.queryParamsStore.filters();
      if (filters) {
        this.updateForm(filters.find((f: Filter) => f.column === this.column()));
      }
    })

    this.subscriptions.add(
      this.form.valueChanges.subscribe((values) => {
        const current = [values.option?.toString() ?? '', values.customRange?.from ?? '', values.customRange?.to ?? ''];
        if (current.some((value: string) => !!value)) {
          this.hasDateFilter.set(true);
        } else {
          this.hasDateFilter.set(false);
        }
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
    };

    if (value.option !== 'custom-range') {
      filter.operator = dateOption?.operator as FilterOperator;
      if(filter.operator === "between") {
        filter.values = dateOption?.range ?? [];
      } else {
        filter.values = [dateOption?.value ?? ''];
      }
    }
    else if (value.customRange) {
      // if to is null, operator is gte
      // if from is null, operator is lte
      // if both are not null, operator is between

      if (value.customRange.from && value.customRange.to) {
        filter.operator = 'between';
        filter.values = [value.customRange.from, value.customRange.to];
      }
      else if (value.customRange.from) {
        filter.operator = 'gte';
        filter.values = [value.customRange.from];
      }
      else if (value.customRange.to) {
        filter.operator = 'lte';
        filter.values = [value.customRange.to];
      }
    }

    this.updated.emit(filter);
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
    if (!aggregation?.items || aggregation?.items?.length === 0)
      return [];

    const items = aggregation.items;
    const arr = items.reduce((acc, curr) => {
      if (curr.value === '') return acc;

      if((curr.value as string).includes('-')) {
        // if the value contains "-" returns [operator: "between", {from, to}]
        // where from is the first day of the month and to is the last day of the month
        const [yearSection, month] = (curr.value as string).split('-');

        // options from a distribution start with a keyword (e.g.: 'thisMonth:=> [DATE]). Only keep the date
        const yearSectionSplit = yearSection.split(' ');
        const year = yearSectionSplit[yearSectionSplit.length - 1];
        const from = `${year}-${month}-01`;
        const to = `${year}-${month}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`;
        acc.push({
          operator: 'between',
          range: [from, to],
          display: (curr.display ?? curr.value) as string,
          disabled: curr.count === 0
        });
      }
      else {
        const value = this.parseValueAndOperatorFromItem(curr.value as string);
        acc.push({
          operator: value[0],
          value: value[1],
          display: curr.display || value[1],
          disabled: curr.count === 0
        });
      }

      return acc;
    }, [] as DateFilter[]);
    return arr;
  }

  private parseValueAndOperatorFromItem(value: string): [string, string] {
    if(!value.includes(':')) return ['eq', value];

    const skimmed = value.split(':')[1];
    // eslint-disable-next-line prefer-const
    let [operator, valueStr] = skimmed.split(' ');

    switch (operator) {
      case '>=': operator = 'gte'; break;
      case '<=': operator = 'lte'; break;
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

    const operator = filter.operator;
    const values = filter.values;
    const code = this.dateOptions().find((option: DateFilter) => option.operator === operator && option.value === values[0])?.display ?? "custom-range";

    let from, to;
    if (code === 'custom-range') {
      if (operator === 'lte') {
        to = values[0];
      }
      else if (operator === 'gte') {
        from = values[0];
      }
      else if (operator === 'between') {
        from = values[0];
        to = values[1];
      }
    }

    const formValue = {
      option: code,
      customRange: {
        from: (code === 'custom-range') ? from ?? null : null,
        to: (code === 'custom-range') ? to ?? null : null
      }
    };

    this.form.setValue(formValue);
  }
}

import { NgClass } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { Aggregation, AggregationItem, FilterOperator, LegacyFilter } from '@sinequa/atomic';
import { AggregationEx, QueryParamsStore, cn } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipe/syslang';

import { getState } from '@ngrx/signals';
import { AggregationTitle } from '../aggregation/aggregation.component';

const ALLOW_CUSTOM_RANGE = true;
type FieldValue = string | number | Date | boolean | Array<string | { value: string, display?: string }>;
type DateFilter = {
  label?: string;
  operator?: FilterOperator;
  value?: string;
  range?: [string, string];
  display?: string;
  disabled?: boolean;
  hidden?: boolean;
}


const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, TranslocoPipe, SyslangPipe],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.scss',
  providers: [provideTranslocoScope({ scope: 'filters', loader })]
})
export class DateFilterComponent implements OnDestroy {
  cn = cn;
  aggregation = input.required<AggregationEx>();
  title = input<AggregationTitle>({ label: 'Date', icon: 'fas fa-calendar' });
  displayEmptyDistributionIntervals = input<boolean>(false);


  @Output() public readonly refreshed = new EventEmitter<LegacyFilter>();
  @Output() public readonly updated = new EventEmitter<LegacyFilter>();
  @Output() public readonly valueChanged = new EventEmitter<LegacyFilter>();

  protected readonly allowCustomRange = ALLOW_CUSTOM_RANGE;

  protected readonly queryParamsStore = inject(QueryParamsStore);

  protected readonly dateOptions = computed(() => this.translateAggregationToDateOptions(this.aggregation()));

  protected readonly column = computed(() => this.aggregation().column);

  protected readonly hasAppliedFilter = computed(() => {
    return this.column() ? !!this.queryParamsStore.getFilterFromColumn(this.column()) : false;
  });

  protected readonly form = new FormGroup({
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
      const filters = getState(this.queryParamsStore).filters || [];
      if (filters) {
        this.updateForm(filters?.find((f: LegacyFilter) => f.field === this.column()));
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

    if (value.option !== 'custom-range') {
      const dateOption = this.dateOptions().find((option: DateFilter) => option.display === value.option);
      this.updated.emit({operator: dateOption?.operator || 'eq', field: this.column(), display: dateOption?.display ?? '', value: dateOption?.value});
    }
    else if (value.customRange) {
      // if to is null, operator is gte
      // if from is null, operator is lte
      // if both are not null, operator is between
      const filter: LegacyFilter = {
        field: this.column(),
        display: value.option as string
      };

      if (value.customRange.from && value.customRange.to) {
        filter.operator = 'between';
        filter.start = value.customRange.from;
        filter.end = value.customRange.to;
      }
      else if (value.customRange.from) {
        filter.operator = 'gte';
        filter.value = value.customRange.from;
      }
      else if (value.customRange.to) {
        filter.operator = 'lte';
        filter.value = value.customRange.to;
      }

      this.updated.emit(filter);
    }

  }

  public clearFilters(notifyAsUpdated: boolean = true): void {
    this.form.setValue({
      option: null,
      customRange: {
        from: null,
        to: null
      }
    })

    if (notifyAsUpdated) this.updated.emit({ field: this.column(), display: '', values: [] });
  }

  protected forceFilterToCustomRange(): void {
    this.form.get('option')?.setValue('custom-range');
  }

  private translateAggregationToDateOptions(aggregation: Aggregation): DateFilter[] {
    if (!aggregation?.items || aggregation?.items?.length === 0)
      return [];

    const items = aggregation.items;
    const arr = items.reduce((acc, curr) => {
      // if the value is empty, skip it
      if(!curr.value) return acc;

      // if the value is a empty string, skip it
      if (curr.value === '') return acc;

        const value = this.parseValueAndOperatorFromItem(curr);
        acc.push({
          operator: value.operator,
          value: value.value,
          display: curr.display || value.display,
          disabled: curr.count === 0,
          hidden: curr.count === 0 && aggregation.isDistribution
            ? !this.displayEmptyDistributionIntervals()
            : false
        });

      return acc;
    }, [] as DateFilter[]);

    return arr;
  }

  protected parseValueAndOperatorFromItem(item: AggregationItem) {
    const field = this.aggregation().column;
    const res = (item.value as string).match(/.*\:\(?([><=\d\-\.AND ]+)\)?/);
    if (res?.[1]) {
      const expr = res?.[1].split(" AND ");
      const filters = expr.map(e => {
        const operator: 'gte' | 'lt' = e.indexOf('>=') !== -1 ? 'gte' : 'lt';
        let value: FieldValue = e.substring(e.indexOf(' ') + 1);
        return { field, operator, value, display: item.display || item.value };
      });

      if (filters.length === 2) {
        return { operator: 'and', filters, display: filters[0].display || filters[0].value, field } as LegacyFilter;
      }
      else if (filters.length === 1) {
        return { ...filters[0], field } as LegacyFilter;
      }
      throw new Error("Failed to parse distribution expression");
    }

    return { field, operator: 'eq', value: item.value as string | number | boolean , display: item.display } as LegacyFilter;

  }

  private updateForm(filter: LegacyFilter | undefined): void {
    if (!filter) {
      this.clearFilters(false);
      return;
    }

    const operator = filter.operator;
    const value = filter.value;
    const code = this.dateOptions().find((option: DateFilter) => option.operator === operator && option.value === value)?.display ?? "custom-range";

    let from, to;
    if (code === 'custom-range') {
      if (operator === 'lte') {
        to = filter.end;
      }
      else if (operator === 'gte') {
        from = filter.start;
      }
      else if (operator === 'between') {
        from = filter.start;
        to = filter.end;
      }
    }

    const formValue = {
      option: code,
      customRange: {
        from: (code === 'custom-range') ? from ?? null : null,
        to: (code === 'custom-range') ? to ?? null : null
      }
    };

    this.form.setValue(formValue as any);
  }
}

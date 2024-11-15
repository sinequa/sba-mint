import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, inject, InjectionToken, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { Aggregation, AggregationItem, FilterOperator, LegacyFilter, translateAggregationToDateOptions } from '@sinequa/atomic';
import { cn } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipes/syslang';

import { AggEx, AggregationBase } from '../../aggregation/aggregation.base';
import { AggregationTitle } from '../aggregation/aggregation.component';

/**
 * Injection token that indicates whether custom date ranges are allowed.
 *
 * @remarks
 * This token is used to configure the date component to allow users to select custom date ranges.
 *
 * @example
 * ```typescript
 * providers: [
 *   { provide: ALLOW_CUSTOM_RANGE, useValue: false }
 * ]
 * ```
 *
 * @public
 */
export const FILTER_DATE_ALLOW_CUSTOM_RANGE = new InjectionToken<boolean>("date allow custom range", { factory: () => true });

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
  selector: 'DateFilter',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, TranslocoPipe, SyslangPipe],
  templateUrl: './date.component.html',
  styles: `
    :host {
      display: block;
    }

    .data-list {
      scrollbar-width: thin;
    }
  `,
  providers: [provideTranslocoScope({ scope: 'filters', loader })]
})
export class DateComponent extends AggregationBase {
  readonly title = input<AggregationTitle>({ label: 'Date', icon: 'far fa-calendar-day' });
  readonly displayEmptyDistributionIntervals = input<boolean>(false);
  readonly allowCustomRange = inject(FILTER_DATE_ALLOW_CUSTOM_RANGE);

  protected readonly dateOptions = computed(
    () => translateAggregationToDateOptions(this.aggregation() as Aggregation, this.displayEmptyDistributionIntervals())
  );

  protected readonly form = new FormGroup({
    option: new FormControl<string | null>(null),
    customRange: new FormGroup({
      from: new FormControl<string | null>(null),
      to: new FormControl<string | null>(null)
    })
  });
  protected today = new Date().toISOString().split('T')[0];

  readonly hasFilter = signal<boolean>(false);

  cn = cn;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly subscription = new Subscription();

  constructor() {
    super();

    // apply current date filter from queryParamsStore
    effect(() => {
      this.updateForm(this.queryParamsStore.getFilter(this.aggregation()!.column) as LegacyFilter);
    })

    this.subscription.add(
      this.form.valueChanges.subscribe(() => this.hasFilter.set(true))
    );
  }

  protected override processAggregation(): AggEx | null | undefined {
    let agg = super.processAggregation();
    return { ...agg, items: agg?.items?.filter((item: AggregationItem) => item.display !== 'custom-range') ?? [] } as AggEx;
  }

  public apply(): void {
    const filter = this.getFormValueFilter();

    this.queryParamsStore.updateFilter(filter);
  }

  public clear(notify: boolean = true): void {
    this.form.setValue({
      option: null,
      customRange: {
        from: null,
        to: null
      }
    })

    if (notify)
      this.queryParamsStore.updateFilter({ field: this.aggregation()!.column, display: '' });
  }

  private updateForm(filter: LegacyFilter | undefined): void {
    if (!filter) {
      this.clear(false);
      return;
    }

    const { operator, value } = filter;
    const code = this.dateOptions().find((option: DateFilter) => option.operator === operator && option.value === value)?.display ?? "custom-range";

    let from, to;

    if (code === 'custom-range') {
      switch (operator) {
        case ('lte'):
          to = filter.value;
          break;
        case ('gte'):
          from = filter.value;
          break;
        case ('between'):
          from = filter.start;
          to = filter.end;
          break;
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
    this.cdr.detectChanges();
  }

  private getFormValueFilter(): LegacyFilter {
    const value = this.form.value;

    if (value.option !== 'custom-range') {
      const dateOption = this.dateOptions().find((option: DateFilter) => option.display === value.option);

      return {
        operator: dateOption?.operator || 'eq',
        field: this.aggregation()!.column,
        display: dateOption?.display ?? '',
        filters: dateOption?.filters,
        value: dateOption?.value
      };
    }
    else if (value.customRange) {
      // if to is null, operator is gte
      // if from is null, operator is lte
      // if both are not null, operator is between
      const filter: LegacyFilter = {
        field: this.aggregation()!.column,
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

      return filter;
    }

    throw new Error('Invalid filter value');
  }
}

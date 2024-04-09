import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription, combineLatest, of, take, tap } from 'rxjs';

import { AggregationsService, DateFilter, DateFilterCode } from '@/app/services';
import { Filter } from '@/app/utils/models';

import { QueryParamsStore } from '@/app/stores';
import { getState } from '@ngrx/signals';
import { AggregationTitle } from '../aggregation/aggregation.component';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.scss'
})
export class DateFilterComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public column!: string;
  @Input({ required: false }) public title!: AggregationTitle | undefined;

  @Output() public readonly refreshed = new EventEmitter<Filter>();
  @Output() public readonly updated = new EventEmitter<Filter>();
  @Output() public readonly valueChanged = new EventEmitter<Filter>();

  protected readonly dateOptions = signal<DateFilter[]>([]);
  protected readonly hasFilter = computed(() => this.activeFilters().length > 0);
  protected readonly form = new FormGroup({
    option: new FormControl<DateFilterCode | null>(null),
    customRange: new FormGroup({
      from: new FormControl<string | null>(null),
      to: new FormControl<string | null>(null)
    })
  });
  protected today = new Date().toISOString().split('T')[0];

  private readonly activeFilters = signal<string[]>([]);
  private readonly subscriptions = new Subscription();

  private readonly aggregations = inject(AggregationsService);
  private readonly queryParamsStore = inject(QueryParamsStore);

  ngOnInit(): void {
    const updateState$ = combineLatest([
      this.aggregations.getMockDateAggregation$(),
      of(getState(this.queryParamsStore).filters)
    ])
      .pipe(
        tap(([options, filters]) => {
          this.dateOptions.set(options);
          this.activeFilters.set(filters?.find((f: Filter) => f.column === this.column)?.values ?? []);

          this.updateForm(filters?.find((f: Filter) => f.column === this.column));
        })
      );
    const initialized$ = updateState$.pipe(
      take(1)
    );

    this.subscriptions.add(
      updateState$.subscribe(() => {
        this.refreshed.emit({ column: this.column, label: this.getLabel(), values: this.getFilters() });
      })
    );

    this.subscriptions.add(
      initialized$.subscribe(() => {
        this.refreshed.emit({ column: this.column, label: this.getLabel(), values: this.getFilters() });
      })
    );

    this.subscriptions.add(
      this.form.valueChanges.subscribe((values) => {
        const current = [values.option?.toString() ?? '', values.customRange?.from ?? '', values.customRange?.to ?? ''];

        if (current.filter((value: string) => value === '').length === 3) current.length = 0;

        this.activeFilters.set(current);
        this.valueChanged.emit({ column: this.column, label: this.getLabel(), values: current });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public submit(): void {
    const value = this.form.value;
    const dateOption = this.dateOptions().find((option: DateFilter) => option.code === value.option);
    const filter: Filter = { column: this.column, label: dateOption?.label, values: [] };

    if (value.option !== 'custom-range') {
      const [, from, to] = dateOption?.calculated() ?? [null, null, null];

      filter.values = [
        value.option?.toString() ?? '',
        from?.toISOString().split('T')[0] ?? '',
        to?.toISOString().split('T')[0] ?? ''
      ];
    } else {
      filter.values = [
        value.option?.toString() ?? '',
        value.customRange?.from ?? '',
        value.customRange?.to ?? ''
      ];
    }

    this.updated.emit(filter);
  }

  public getFilters(): string[] {
    return this.activeFilters();
  }

  public getLabel(): string {
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

    if (notifyAsUpdated) this.updated.emit({ column: this.column, label: undefined, values: [] });
  }

  protected forceFilterToCustomRange(): void {
    this.form.get('option')?.setValue('custom-range');
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

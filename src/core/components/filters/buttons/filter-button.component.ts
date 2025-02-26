import { NgClass } from '@angular/common';
import { Component, effect, ElementRef, inject, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  AggregationsStore,
  AppStore,
  ButtonComponent,
  ButtonVariants,
  cn,
  DropdownComponent,
  DropdownContentComponent,
  PopoverComponent,
  PopoverContentComponent,
  QueryParamsStore
} from '@sinequa/atomic-angular';

import { SyslangPipe } from '../../../pipes/syslang';
import { AggregationComponent } from '../aggregation/aggregation.component';
import { CFilterEx } from '../filters.models';

@Component({
  selector: 'filter-button, FilterButton',
  standalone: true,
  imports: [ButtonComponent, PopoverComponent, PopoverContentComponent, TranslocoPipe, AggregationComponent, SyslangPipe],
  template: `
    <Popover [disabled]="filter().disabled">
      <button
        [variant]="variant()"
        [attr.data-disabled]="filter().disabled"
        [disabled]="filter().disabled || null"
        [class]="cn('btn w-max gap-1 font-semibold', filter().count ? 'btn-primary' : 'btn-tertiary')">
        @if (filter().icon) {
          <i class="fa-fw {{ filter().icon }} " aria-hidden="true"></i>
        }
        {{ filter().display || filter().name | syslang | transloco }}
        @if (filter().isTree && filter().count > 0) {
          <span class="pill pill-ghost pill-xs flex size-5 place-content-center bg-white font-semibold text-blue-600">
            {{ filter().count }}
          </span>
        } @else if (filter().count > 1) {
          <span class="pill pill-ghost pill-xs flex size-5 place-content-center bg-white font-semibold text-blue-600">
            <i class="fas fa-plus my-auto text-[0.5rem]" aria-hidden="true"></i>
            {{ filter().count - 1 }}
          </span>
        }
      </button>
      <PopoverContent class="w-max">
        <Aggregation [name]="filter().name" [searchable]="true" />
      </PopoverContent>
    </Popover>
  `,
  host: {
    '[class.hidden]': 'filter().hidden'
  }
})
export class FilterButtonComponent {
  cn = cn;

  variant = signal<ButtonVariants['variant']>('secondary');

  nativeElement = inject(ElementRef).nativeElement;

  column = input.required<string>();
  filter = signal<CFilterEx>({
    name: '',
    icon: '',
    column: '',
    display: '',
    isTree: false,
    count: 0,
    hidden: false,
    disabled: false
  });

  aggregationsStore = inject(AggregationsStore);
  queryParamsStore = inject(QueryParamsStore);
  appStore = inject(AppStore);

  constructor() {
    effect(
      () => {
        const agg = this.aggregationsStore.getAggregation(this.column(), 'column');
        const f = this.queryParamsStore.getFilter(agg?.name);
        const count = f?.count || 0;

        if (!agg) return;

        const { icon, hidden = false } = this.appStore.getAggregationCustomization(this.column()) || {};
        const { display = agg?.isTree ? undefined : f?.display } = this.appStore.getAggregationCustomization(this.column()) || {};

        const r = {
          name: agg?.name,
          column: this.column(),
          icon,
          hidden,
          display,
          isTree: agg?.isTree || false,
          count,
          disabled: !agg?.items || agg.items?.length === 0 ? true : false
        };

        this.filter.set(r);
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const f = this.filter();
        this.variant.update(v => (f.count ? 'default' : 'secondary'));
      },
      { allowSignalWrites: true }
    );
  }
}

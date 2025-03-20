import { Component, effect, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { QueryParamsStore } from '@sinequa/atomic-angular';
import { ButtonComponent, ButtonVariants, cn, PopoverComponent, PopoverContentComponent } from '@sinequa/ui';

import { OperatorPipe } from '../../../pipes/operator';
import { SyslangPipe } from '../../../pipes/syslang';
import { CFilterEx } from '../filters.models';
import { DateComponent } from './date.component';

@Component({
  selector: 'date-button, DateButton',
  standalone: true,
  imports: [ButtonComponent, PopoverComponent, PopoverContentComponent, TranslocoPipe, DateComponent, OperatorPipe, SyslangPipe],
  template: `
    <Popover [disabled]="filter().disabled" class="group">
      <button
        [variant]="variant()"
        class="group-data-[open=true]:border group-data-[open=true]:border-gray-200"
        [attr.data-disabled]="filter().disabled"
        [disabled]="filter().disabled || null">
        @if (filter().icon) {
          <i class="fa-fw {{ filter().icon }} " aria-hidden="true"></i>
        }
        @if (filter().legacyFilter) {
          <span [innerHTML]="filter().legacyFilter | operator | syslang | transloco"></span>
        } @else {
          {{ filter().display || filter().name | transloco }}
        }
        @if (filter().isTree && filter().count > 0) {
          <span class="flex size-5 place-content-center rounded-full bg-white font-semibold text-blue-600">
            {{ filter().count }}
          </span>
        } @else if (filter().count > 1) {
          <span class="flex size-5 place-content-center rounded-full bg-white font-semibold text-blue-600">
            <i class="fas fa-plus my-auto text-[0.5rem]" aria-hidden="true"></i>
            {{ filter().count - 1 }}
          </span>
        }
      </button>

      <PopoverContent position="bottom-start">
        <DateFilter class="w-max min-w-[300px]" name="Modified" [title]="{ label: 'Date', icon: 'far fa-calendar-day' }" />
      </PopoverContent>
    </Popover>
  `
})
export class DateButtonComponent {
  cn = cn;

  variant = signal<ButtonVariants['variant']>('ghost');

  queryParamsStore = inject(QueryParamsStore);

  filter = signal<CFilterEx>({
    name: 'Modified',
    column: 'modified',
    display: 'Date',
    icon: 'far fa-calendar-day',
    count: 0,
    isTree: false,
    disabled: false,
    hidden: false
  });

  constructor() {
    effect(
      () => {
        const filter = this.queryParamsStore.getFilter('modified');
        this.filter.update(f => {
          f.count = filter?.count || 0;
          f.legacyFilter = filter || undefined;
          return f;
        });
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const f = this.filter();
        this.variant.update(v => (f.count ? 'default' : 'ghost'));
      },
      { allowSignalWrites: true }
    );
  }
}

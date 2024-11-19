import { NgClass } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { cn, DropdownComponent, QueryParamsStore } from "@sinequa/atomic-angular";
import { CFilterEx } from "../filters.models";
import { DateComponent } from "../date/date.component";
import { OperatorPipe } from "../../../pipes/operator";
import { SyslangPipe } from "../../../pipes/syslang";

@Component({
  selector: 'filter-date-button, FilterDateButton',
  standalone: true,
  imports: [NgClass, DropdownComponent, TranslocoPipe, DateComponent, OperatorPipe, SyslangPipe],
  template: `
    <Dropdown [disabled]="filter().disabled">
      <button
        [attr.data-disabled]="filter().disabled"
        [disabled]="filter().disabled || null"
        [ngClass]="cn(
          'btn font-semibold gap-1 w-max',
          filter().count ? 'btn-primary': 'btn-tertiary'
          )">
        @if (filter().icon) {
          <i class="fa-fw {{ filter().icon }} " aria-hidden="true"></i>
        }
        @if( filter().legacyFilter ) {
            <span [innerHTML]="filter().legacyFilter | operator | syslang | transloco"></span>
        }
        @else {
          {{ (filter().display || filter().name) | transloco }}
        }
        @if(filter().isTree && filter().count > 0) {
          <span class="pill size-5 pill-xs pill-ghost bg-white flex place-content-center font-semibold text-blue-600">
            {{ filter().count }}
          </span>
        }
        @else if (filter().count > 1) {
          <span class="pill size-5 pill-xs pill-ghost bg-white flex place-content-center font-semibold text-blue-600">
            <i class="fas fa-plus text-[0.5rem] my-auto " aria-hidden="true"></i>
            {{ filter().count - 1 }}
          </span>
        }
      </button>

      <DateFilter dropdown-content
            class="block dropdown-content min-w-[300px] w-max"
            name="Modified"
            [title]="{label: 'Date', icon: 'far fa-calendar-day'}"
          />

    </Dropdown>
          	`
}) export class FilterDateButtonComponent {
  cn = cn;

  queryParamsStore = inject(QueryParamsStore);

  filter = signal<CFilterEx>({
    name: "Modified",
    column: "modified",
    display: "Date",
    icon: 'far fa-calendar-day',
    count: 0,
    isTree: false,
    disabled: false,
    hidden: false,
  });

  constructor() {

    effect(() => {
      const filter = this.queryParamsStore.getFilter("modified");
      this.filter.update( f => {
        f.count = filter?.count || 0;
        f.legacyFilter = filter || undefined;
        return f;
      })
    }, {allowSignalWrites: true});
  }

}

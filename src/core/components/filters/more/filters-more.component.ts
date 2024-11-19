import { Component, effect, inject, input, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AggregationsStore, AppStore, CFilter, cn, QueryParamsStore } from "@sinequa/atomic-angular";
import { AggregationComponent } from "../aggregation/aggregation.component";
import { CFilterEx } from "../filters.models";

@Component({
  selector: 'filters-more, FiltersMore',
  standalone: true,
  imports: [AggregationComponent, TranslocoPipe],
  template: `
  @for(filter of filters(); track $index) {
    <li [class]="cn(
      'collapse mb-1 bg-base-200',
      filter.disabled && 'cursor-default select-none pointer-events-none',
      filter.hidden && 'hidden'
    )">
      <!-- header -->
      <input
        role="button"
        type="radio"
        name="more-filters"
        class="w-full"
        [attr.title]="'filters.openFilter' | transloco: { filter: filter.display || filter.name }"
      />

      <div [class]="cn(
        'collapse-title dropdown-header p-2 flex gap-1 items-center',
        filter.disabled && 'text-slate-300'
        )">
        <!-- aggregation's icon -->
        <i class="fa-fw {{ filter.icon || 'fas fa-list' }} me-1"></i>

        <!-- aggregation label -->
        <span class="me-4 grow">{{ filter.display || filter.name | transloco }}</span>
        @if(filter.count > 0) {
          <!-- count -->
          <span class="ms-2 pill size-5 pill-xs pill-ghost bg-primary flex place-content-center font-semibold text-white">
            {{ filter.count }}
          </span>
        }
        <!-- remove filter -->
        <button class="z-10"
          [attr.title]="'filters.clearFilters' | transloco"
          (click)="clearFilter(filter.column)"
          (keydown.enter)="clearFilter(filter.column)"
          >
          <i class="fa-fw far fa-filter-circle-xmark"></i>
        </button>
        @if(agg.selectionCount()) {
          <button
            type="button"
            class="btn btn-ghost z-10"
            [attr.title]="'filters.applyFilters' | transloco"
            (click)="agg.apply()"
            >
            <i class="fa-fw far fa-filter"></i>
          </button>
        }
      </div>
      <Aggregation #agg class="collapse-content ml-2 mr-2"
        dropdown-content
        [name]="filter.column"
        kind="column"
        [headless]="true"
        [searchable]="true"
        />
    </li>
  }
  `,
  host: {
    "class": "divide-y",
  },
  styles: [`
    :host {
      scrollbar-width: none;
    }
  `]
}) export class FiltersMoreComponent {
  cn = cn;
  count = input<number>(2);

  route = inject(ActivatedRoute)
  appStore = inject(AppStore);
  aggregationsStore = inject(AggregationsStore);
  queryParamsStore = inject(QueryParamsStore);


  filters = signal<CFilterEx[]>([]);

  constructor() {

    effect(() => {
      const count = this.count();

      const authorizedFilters = this.appStore.getAuthorizedFilters(this.route)
        .filter(f => f.name !== "Modified")
        .map(f => f.column)
        .toSpliced(0, count);

      const f = authorizedFilters.map(filter => {
        const { icon, hidden = false } = this.appStore.getAggregationCustomization(filter) as CFilter || {};
        return ({
          name: filter,
          column: filter,
          icon,
          count: 0,
          isTree: false,
          disabled: false,
          hidden,
        })
      })

      this.filters.set(f);
      this.updateFilters();
    }, { allowSignalWrites: true });

  }

  clearFilter(field: string) {
    this.queryParamsStore.removeFilter(field);
  }

  updateFilters() {
    this.filters.update( filters => {
      return filters.map(filter => {
        const agg = this.aggregationsStore.getAggregation(filter.column, "column");
        const f = this.queryParamsStore.getFilter(agg?.name);
        const count = f?.count || 0;

        const { display = agg?.isTree ? undefined : filter.display } = this.appStore.getAggregationCustomization(filter.column) as CFilter || {};

        return {...filter,
          name: agg?.name || filter.name,
          display,
          isTree: agg?.isTree || false,
          count,
          disabled: !agg?.items || agg.items?.length === 0 ? true : false
        };
      })
    });
  }
}
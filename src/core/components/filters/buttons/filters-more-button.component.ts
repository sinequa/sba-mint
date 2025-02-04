import { Component, computed, effect, ElementRef, inject, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore, DropdownComponent, QueryParamsStore } from '@sinequa/atomic-angular';
import { FiltersMoreComponent } from '../more/filters-more.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'filters-more-button, FiltersMoreButton',
  standalone: true,
  imports: [DropdownComponent, TranslocoPipe, FiltersMoreComponent],
  template: `
    <Dropdown class="dropdown-end">
      <button class="btn btn-tertiary gap-1 truncate font-semibold" aria-label="more filters">
        <i class="far fa-filters"></i>
        <span>{{ 'filters.moreFilters' | transloco }}</span>

        @if (totalFiltersCount() > 0) {
          <span class="pill pill-ghost pill-xs ms-1 flex size-5 place-content-center bg-primary font-semibold text-white">
            {{ totalFiltersCount() }}
          </span>
        }
      </button>

      <FiltersMore dropdown-content [count]="count()" class="dropdown-content absolute mt-1 max-h-96 max-w-80 overflow-y-scroll p-1" />
    </Dropdown>
  `
})
export class FiltersMoreButtonComponent {
  route = inject(ActivatedRoute);
  appStore = inject(AppStore);
  queryParamsStore = inject(QueryParamsStore);
  nativeElement = inject(ElementRef).nativeElement;

  count = input<number>(2);

  totalFiltersCount = computed(() => {
    const count = this.count();

    const authorizedFilters = this.appStore
      .getAuthorizedFilters(this.route)
      .filter(f => f.name !== 'Modified')
      .filter(f => f.column !== 'modified')
      .map(f => f.column)
      .toSpliced(0, count);

    const total = authorizedFilters.reduce((acc, filter) => {
      const f = this.queryParamsStore.getFilter(filter);
      acc += f?.count || 0;
      return acc;
    }, 0);
    return total;
  });
}

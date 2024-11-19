import { Component, computed, effect, ElementRef, inject, input, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { AppStore, DropdownComponent, QueryParamsStore } from "@sinequa/atomic-angular";
import { FiltersMoreComponent } from "../more/filters-more.component";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'filters-more-button, FiltersMoreButton',
  standalone: true,
  imports: [DropdownComponent, TranslocoPipe, FiltersMoreComponent],
  template: `
<Dropdown class="dropdown-end">
  <button class="btn btn-tertiary font-semibold gap-1 truncate" aria-label="more filters">
    <i class="far fa-filters"></i>
    <span>{{ 'filters.moreFilters' | transloco }}</span>

    @if (totalFiltersCount() > 0) {
      <span class="ms-1 pill size-5 pill-xs pill-ghost bg-primary flex place-content-center font-semibold text-white">
        {{ totalFiltersCount() }}
      </span>
    }
  </button>

  <FiltersMore dropdown-content [count]="count()" class="absolute dropdown-content p-1 mt-1 max-w-80 max-h-96 overflow-y-scroll" />
</Dropdown>
  `,
}) export class FiltersMoreButtonComponent {
  route = inject(ActivatedRoute);
  appStore = inject(AppStore);
  queryParamsStore = inject(QueryParamsStore);
  nativeElement = inject(ElementRef).nativeElement;

  count = input<number>(2);

  totalFiltersCount = computed(() => {
    const count = this.count();

    const authorizedFilters = this.appStore.getAuthorizedFilters(this.route)
      .filter(f => f.name !== "Modified")
      .filter(f => f.column !== "modified")
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

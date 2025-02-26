import { Component, computed, ElementRef, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore, ButtonComponent, PopoverComponent, PopoverContentComponent, QueryParamsStore } from '@sinequa/atomic-angular';
import { MoreComponent } from './more.component';

@Component({
  selector: 'more-button, MoreButton',
  standalone: true,
  imports: [ButtonComponent, PopoverComponent, PopoverContentComponent, TranslocoPipe, MoreComponent],
  template: `
    <Popover>
      <button variant="secondary" class="gap-1 truncate font-semibold" aria-label="more filters">
        <i class="far fa-filters"></i>
        <span>{{ 'filters.moreFilters' | transloco }}</span>

        @if (totalFiltersCount() > 0) {
          <span class="pill pill-ghost pill-xs ms-1 flex size-5 place-content-center bg-primary font-semibold text-white">
            {{ totalFiltersCount() }}
          </span>
        }
      </button>

      <PopoverContent position="bottom-end">
        <More [count]="count()" class="max-h-96 max-w-80 overflow-y-scroll" />
      </PopoverContent>
    </Popover>
  `
})
export class MoreButtonComponent {
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

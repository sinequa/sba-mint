import { SearchService } from "@/app/services";
import { Component, computed, effect, inject, input, signal } from "@angular/core";

export type PageConfiguration = {
  page: number,
  rowCount: number,
  pageSize: number;
}

@Component({
  selector: 'app-pager',
  standalone: true,
  template: `
  <div class="flex gap-2">
    @if((hasPages() && page() > 1) || (!hasPages() && page() > 1)) {
      <button type="button"
        class="btn btn-ghost mt-4 text-center inline-flex items-center"
        (click)="previousPage()"
        >
        <svg class="rotate-180 me-2 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
        </svg>
        Previous page
      </button>
    }
    @if(hasPages()){
      <button type="button"
        class="btn btn-ghost mt-4 text-center inline-flex items-center"
        (click)="nextPage()"
        >
        Next page
        <svg class="ms-2 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
        </svg>
      </button>
    }
  </div>
  `
})
export class PagerComponent {
  configuration = input.required<PageConfiguration>();

  searchService = inject(SearchService);

  page = signal(0);

  hasPages = computed(() => {
    const {page, pageSize, rowCount} = this.configuration();
    return (page * pageSize) < rowCount;
  });

  constructor() {
    effect(() => {
      this.page.set(this.configuration().page);
    }, {allowSignalWrites: true});
  }


  nextPage() {
    this.page.set(this.page() + 1);
    this.searchService.gotoPage(this.page());
  }
  previousPage() {
    this.page.set(this.page() - 1);
    this.searchService.gotoPage(this.page());
  }
}
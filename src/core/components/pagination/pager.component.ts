import { Component, computed, effect, inject, input, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";

import { SearchService } from "@sinequa/atomic-angular";

export type PageConfiguration = {
  page: number;
  rowCount: number;
  pageSize: number;
}

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [TranslocoPipe],
  template: `
  <div class="flex gap-2">
    @if ((hasPages() && page() > 1) || (!hasPages() && page() > 1)) {
      <button
        class="btn btn-ghost mt-4 text-center inline-flex items-center"
        [attr.title]="'previousPage' | transloco"
        (click)="previousPage()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="rotate-180 me-2 w-3.5 h-3.5"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 14 10"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"
          />
        </svg>

        {{ 'previousPage' | transloco }}
      </button>
    }

    @if (hasPages()) {
      <button
        class="btn btn-ghost mt-4 text-center inline-flex items-center"
        [attr.title]="'nextPage' | transloco"
        (click)="nextPage()"
      >
        {{ 'nextPage' | transloco }}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="ms-2 w-3.5 h-3.5"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 14 10"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"
          />
        </svg>
      </button>
    }
  </div>
  `
})
export class PagerComponent {
  public readonly configuration = input.required<PageConfiguration>();

  protected readonly page = signal(0);
  protected readonly hasPages = computed(() => {
    const {page, pageSize, rowCount} = this.configuration();
    return (page * pageSize) < rowCount;
  });
  
  private readonly searchService = inject(SearchService);

  constructor() {
    effect(() => {
      this.page.set(this.configuration().page);
    }, { allowSignalWrites: true });
  }

  public nextPage(): void {
    this.page.set(this.page() + 1);
    this.searchService.gotoPage(this.page());
  }
  
  public previousPage(): void {
    this.page.set(this.page() - 1);
    this.searchService.gotoPage(this.page());
  }
}
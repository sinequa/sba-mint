import { afterNextRender, Component, effect, ElementRef, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { getState } from '@ngrx/signals';

import { Article, LegacyFilter } from '@sinequa/atomic';
import { DropdownComponent, QueryParamsStore } from '@sinequa/atomic-angular';

import { SourceIconComponent } from "../source-icon/source-icon.component";

@Component({
  selector: 'DocumentLocator',
  standalone: true,
  imports: [SourceIconComponent, DropdownComponent],
  template: `
    <SourceIcon
      class="fa-fw flex"
      [collection]="article().collection"
    />

    @for (segment of locationSegments(); track $index) {
      <i class="fa-fw far fa-chevron-right"></i>
      
      <div
        class="whitespace-nowrap"
        role="button"
        (click)="navigateToSegment($index)"
      >
        {{ segment }}
      </div>      
    }

    @if (moreSegments().length > 0) {
      <i class="fa-fw far fa-chevron-right"></i>

      <Dropdown position="bottom" [autoClose]="true">
        <button class="p-1 rounded-full">...</button>

        <div class="flex gap-1 items-center rounded-full bg-white py-1 px-2 shadow-md" dropdown-content>
          @for (segment of locationSegments().slice(0, -1); track $index) {
            <button
              class="py-1 px-2 rounded-full hover:bg-blue-100"
              (click)="navigateToSegment($index)"
            >
              {{ segment }}
            </button>

            @if (locationSegments().length > 1 && !$last) {
              <i class="fa-fw far fa-chevron-right"></i>
            }
          }
        </div>
      </Dropdown>
    }
  `,
  host: {
    class: 'flex grow gap-2 overflow-hidden border border-pink-500'
  }
})
export class DocumentLocatorComponent {
  readonly article = input.required<Article>();

  readonly el = inject(ElementRef);
  readonly router = inject(Router);
  readonly queryParamStore = inject(QueryParamsStore);

  readonly locationSegments = signal<string[]>([]);
  readonly moreSegments = signal<string[]>([]);

  readonly resizeObserver = new ResizeObserver(() => this.resized());

  constructor() {
    this.resizeObserver.observe(this.el.nativeElement);
    afterNextRender({ write: () => this.resized() });

    effect(() => {
      const article = this.article();
      untracked(() => this.locationSegments.set(article.treepath[0]?.split('/').slice(1, -1) ?? []));
    })
  }

  resized(): void {
    console.log('resized', this.el.nativeElement.scrollWidth, this.el.nativeElement.clientWidth);
    if (this.el.nativeElement.scrollWidth <= this.el.nativeElement.clientWidth) return;

    debugger;
    console.log('overflow');
    let lastSegment: string | undefined;

    this.locationSegments.update((arr) => {
      lastSegment = arr.pop();
      return arr;
    });

    if (!lastSegment) return;

    this.moreSegments.update((arr) => {
      arr.unshift(lastSegment!);
      return arr;
    });

    console.log(this.locationSegments(), this.moreSegments());
  }

  navigateToSegment(index: number): void {
    let currentFilter = this.queryParamStore.getFilter('Treepath');

    currentFilter ??= { field: 'treepath', operator: 'in' } as LegacyFilter;
    currentFilter.values ??= [];
    currentFilter.values.push(`/${this.locationSegments().slice(0, index + 1).join('/')}/*`);

    this.queryParamStore.updateFilter(currentFilter);

    const { filters } = getState(this.queryParamStore);

    this.router.navigate([], { queryParams: { f: JSON.stringify(filters) }, queryParamsHandling: 'merge' });
  }
}

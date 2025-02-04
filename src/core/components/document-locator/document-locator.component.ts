import { afterNextRender, Component, effect, ElementRef, inject, input, OnDestroy, signal, untracked, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { getState } from '@ngrx/signals';

import { Article, LegacyFilter } from '@sinequa/atomic';
import { DropdownComponent, QueryParamsStore } from '@sinequa/atomic-angular';

import { SourceIconComponent } from '../source-icon/source-icon.component';

@Component({
  selector: 'DocumentLocator',
  standalone: true,
  imports: [SourceIconComponent, DropdownComponent],
  template: `
    <!-- Renders all segment hidden to user to compute width -->
    <div #shadowRender class="pointer-events-none invisible absolute left-0 top-0 -z-10 flex gap-2">
      @for (segment of locationSegments(); track $index) {
        <span class="whitespace-nowrap">{{ segment }}</span>

        @if (!$last) {
          <i class="fal fa-chevron-right"></i>
        }
      }
    </div>

    <SourceIcon class="flex" [collection]="article().collection" />

    <i class="fal fa-chevron-right"></i>

    <div #documentLocator class="flex grow gap-2">
      @for (segment of visibleSegments(); track $index) {
        <div class="whitespace-nowrap" role="button" (click)="navigateToSegment($index)">
          {{ segment }}
        </div>

        @if (!$last) {
          <i class="fa fal fa-chevron-right"></i>
        }
      }

      @if (visibleSegments().length > 0 && invisibleSegments().length > 0) {
        <i class="fa fal fa-chevron-right"></i>
      }

      @if (invisibleSegments().length > 0) {
        <Dropdown position="bottom" [autoClose]="true">
          <button class="rounded-full px-1">...</button>

          <div class="flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-md" dropdown-content>
            @for (segment of invisibleSegments(); track $index) {
              <button class="rounded-full px-2 py-1 hover:bg-blue-100" (click)="navigateToSegment($index)">
                {{ segment }}
              </button>

              @if (!$last) {
                <i class="fa-fw far fa-chevron-right"></i>
              }
            }
          </div>
        </Dropdown>
      }
    </div>
  `,
  host: {
    class: 'flex grow gap-2 overflow-hidden'
  }
})
export class DocumentLocatorComponent implements OnDestroy {
  readonly article = input.required<Article>();

  readonly shadow = viewChild('shadowRender', { read: ElementRef });
  readonly client = viewChild('documentLocator', { read: ElementRef });

  readonly el = inject(ElementRef);
  readonly router = inject(Router);
  readonly queryParamStore = inject(QueryParamsStore);

  readonly locationSegments = signal<string[]>([]);
  readonly visibleSegments = signal<string[]>([]);
  readonly invisibleSegments = signal<string[]>([]);

  // margin for dropdown segment with separator
  readonly margin = 50;

  resizeObserver?: ResizeObserver = new ResizeObserver(() => this.onResize());

  constructor() {
    this.resizeObserver!.observe(this.el.nativeElement);

    afterNextRender({ write: () => this.onResize() });

    effect(() => {
      const article = this.article();
      untracked(() => this.locationSegments.set(article.treepath[0]?.split('/').slice(1, -1) ?? []));
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver!.disconnect();
    this.resizeObserver = undefined;
  }

  onResize(): void {
    const shadowElement = this.shadow()?.nativeElement as HTMLElement;
    const startPos = shadowElement.getBoundingClientRect().left;
    const clientWidth = (this.client()?.nativeElement as HTMLElement).clientWidth;

    if (!shadowElement.children || shadowElement.children.length === 0) return;

    let i = 0;

    for (; i < shadowElement.children.length; ++i) {
      // process if not a separator
      if (i % 2 === 0) {
        const width = shadowElement.children[i].getBoundingClientRect().right - startPos;

        if (width + this.margin >= clientWidth) break;
      }
    }

    console.log('can show', Math.ceil(i / 2), 'elements');

    this.visibleSegments.set(this.locationSegments().slice(0, Math.ceil(i / 2)));
    this.invisibleSegments.set(this.locationSegments().slice(Math.ceil(i / 2)));
  }

  navigateToSegment(index: number): void {
    let currentFilter = this.queryParamStore.getFilter('Treepath');

    currentFilter ??= { field: 'treepath', operator: 'in' } as LegacyFilter;
    currentFilter.values ??= [];
    currentFilter.values.push(
      `/${this.locationSegments()
        .slice(0, index + 1)
        .join('/')}/*`
    );

    this.queryParamStore.updateFilter(currentFilter);

    const { filters } = getState(this.queryParamStore);

    this.router.navigate([], { queryParams: { f: JSON.stringify(filters) }, queryParamsHandling: 'merge' });
  }
}

import { afterNextRender, Component, effect, ElementRef, inject, input, OnDestroy, signal, untracked, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { getState } from '@ngrx/signals';

import { Article, LegacyFilter } from '@sinequa/atomic';
import { QueryParamsStore } from '@sinequa/atomic-angular';
import { BadgeComponent, ButtonComponent, PopoverComponent, PopoverContentComponent } from '@sinequa/ui';

import { SourceIconComponent } from '../source-icon/source-icon.component';

@Component({
  selector: 'DocumentLocator',
  standalone: true,
  imports: [SourceIconComponent, BadgeComponent, ButtonComponent, PopoverComponent, PopoverContentComponent],
  template: `
    <!-- Renders all segment hidden to user to compute width -->
    <div #shadowRender class="pointer-events-none invisible absolute top-0 left-0 -z-10 flex gap-2">
      @for (segment of locationSegments(); track $index) {
        <span class="whitespace-nowrap">{{ segment }}</span>

        @if (!$last) {
          <i class="fal fa-chevron-right"></i>
        }
      }
    </div>

    <SourceIcon class="flex" [collection]="article().collection" />

    <i class="fal fa-chevron-right"></i>

    <div #documentLocator class="flex grow gap-2 overflow-auto">
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
        <Popover>
          <button variant="outline" class="h-0 w-full p-2">...</button>

          <PopoverContent position="bottom" class="rounded-full px-1">
            @for (segment of invisibleSegments(); track $index) {
              <Badge variant="outline" class="hover:bg-accent hover:cursor-pointer" (click)="navigateToSegment($index)">
                {{ segment }}
              </Badge>

              @if (!$last) {
                <i class="fa-fw far fa-chevron-right"></i>
              }
            }
          </PopoverContent>
        </Popover>
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
  readonly margin = 70;

  previousCount?: number;
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

    if (!this.previousCount || i !== this.previousCount) {
      this.previousCount = i;

      this.visibleSegments.set(this.locationSegments().slice(0, Math.ceil(i / 2)));
      this.invisibleSegments.set(this.locationSegments().slice(Math.ceil(i / 2)));
    }
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

import { Component } from '@angular/core';

@Component({
  selector: 'app-article-default-skeleton, ArticleDefaultSkeleton',
  standalone: true,
  template: `
    <div class="size-10 animate-pulse rounded-full bg-gray-200"></div>

    <div class="flex grow flex-col gap-2">
      <div class="flex flex-col gap-1">
        <div class="pill pill-xs h-4 w-[40%] animate-pulse bg-gray-200"></div>

        <div class="flex gap-2">
          <div class="pill pill-xs me-1 h-4 w-[10%] animate-pulse bg-gray-200"></div>
          <div class="pill pill-xs h-4 w-[20%] animate-pulse bg-gray-200"></div>
          <div class="pill pill-xs h-4 w-[10%] animate-pulse bg-gray-200"></div>
          <div class="pill pill-xs h-4 w-[15%] animate-pulse bg-gray-200"></div>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <div class="pill pill-xs h-4 w-[95%] animate-pulse bg-gray-200"></div>
        <div class="pill pill-xs h-4 w-[40%] animate-pulse bg-gray-200"></div>
      </div>

      <div class="flex gap-2">
        <div class="pill pill-xs h-4 w-[100px] animate-pulse bg-gray-200"></div>
        <div class="pill pill-xs h-4 w-[150px] animate-pulse bg-gray-200"></div>
        <div class="pill pill-xs h-4 w-[80px] animate-pulse bg-gray-200"></div>
      </div>
    </div>
  `,
  styles: `
    :host {
      @apply article pointer-events-none;
    }

    div[stkSkeleton] {
      @apply bg-fixed;
    }
  `
})
export class ArticleDefaultSkeletonComponent {}

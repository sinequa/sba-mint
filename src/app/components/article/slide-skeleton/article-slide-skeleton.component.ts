import { Component } from '@angular/core';

@Component({
  selector: 'app-article-slide-skeleton, ArticleSlideSkeleton',
  standalone: true,
  template: `
    <div class="h-[150px] w-full animate-pulse rounded-t-md bg-gray-200 bg-fixed"></div>

    <div class="flex grow flex-col gap-2 p-3">
      <div class="h-4 w-[60%] animate-pulse rounded-full bg-gray-200 bg-fixed"></div>
      <div class="h-4 w-[40%] animate-pulse rounded-full bg-gray-200 bg-fixed"></div>
    </div>
  `,
  host: {
    class: 'article pointer-events-none flex-col p-0'
  }
})
export class ArticleSlideSkeletonComponent {}

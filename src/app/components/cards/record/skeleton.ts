import { Component } from '@angular/core';

@Component({
  selector: 'record-card-skeleton, recordcardskeleton, RecordCardSkeleton',
  standalone: true,
  template: `
    <div class="size-10 animate-pulse rounded-full bg-gray-300"></div>

    <div class="flex grow flex-col gap-2">
      <div class="flex flex-col gap-1">
        <div class="h-4 w-[40%] animate-pulse rounded-full bg-gray-300"></div>

        <div class="flex gap-2">
          <div class="me-1 h-4 w-[10%] animate-pulse rounded-full bg-gray-300"></div>
          <div class="h-4 w-[20%] animate-pulse rounded-full bg-gray-300"></div>
          <div class="h-4 w-[10%] animate-pulse rounded-full bg-gray-300"></div>
          <div class="h-4 w-[15%] animate-pulse rounded-full bg-gray-300"></div>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <div class="h-4 w-[95%] animate-pulse rounded-full bg-gray-300"></div>
        <div class="h-4 w-[40%] animate-pulse rounded-full bg-gray-300"></div>
      </div>

      <div class="flex gap-2">
        <div class="h-4 w-[100px] animate-pulse rounded-full bg-gray-300"></div>
        <div class="h-4 w-[150px] animate-pulse rounded-full bg-gray-300"></div>
        <div class="h-4 w-[80px] animate-pulse rounded-full bg-gray-300"></div>
      </div>
    </div>
  `,
  host: {
    class: 'article pointer-events-none'
  },
  styles: `
    div[stkSkeleton] {
      background-color: var(--stk-skeleton-color, #e5e7eb);
    }
  `
})
export class RecordSkeleton {}

import { Component } from '@angular/core';
import { cn } from '@sinequa/ui';

@Component({
  selector: 'card-skeleton, cardskeleton, CardSkeleton',
  standalone: true,
  template: `
    <div class="flex items-center gap-2">
      <!-- Icon -->
      <span class="size-10"></span>

      <div class="flex grow flex-col gap-2">
        <!-- Title -->
        <span class="h-5 w-[60%]"></span>
        <!-- Metadata -->
        <div class="flex gap-2">
          <span class="h-4 w-[10%]"></span>
          <span class="h-4 w-[20%]"></span>
          <span class="h-4 w-[10%]"></span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex grow flex-col gap-3">
      <div class="flex flex-col gap-2">
        <span class="h-4 w-[90%]"></span>
        <span class="h-4 w-[40%]"></span>
      </div>

      <div class="flex gap-2">
        <span class="h-4 w-[100px]"></span>
        <span class="h-4 w-[150px]"></span>
        <span class="h-4 w-[80px]"></span>
      </div>
    </div>
  `,
  host: {
    '[class]': 'cn("flex flex-col p-2 gap-3 pointer-events-none", "[&_span]:bg-muted-foreground/50 [&_span]:animate-pulse [&_span]:rounded-full")'
  }
})
export class CardSkeleton {
  cn = cn;
}

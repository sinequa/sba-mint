import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <svg
        class="mb-8 h-20 w-20 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <h1 class="mb-4 text-4xl font-bold">Oops! Something went wrong</h1>
      <p class="mb-8 text-xl text-muted-foreground">We apologize for the inconvenience.</p>
      <div class="flex space-x-4">
        <button
          (click)="reload()"
          class="btn btn-outline rounded-lg border-neutral-300 text-neutral-700 transition hover:bg-neutral-200 hover:text-neutral-700">
          <svg
            class="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Go to Homepage
        </button>
      </div>
    </div>
  `
})
export class ErrorComponent {
  router = inject(Router);

  reload() {
    this.router.navigate(['/']).then(() => window.location.reload());
  }
}

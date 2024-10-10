import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
    <svg class="w-20 h-20 text-red-600 mb-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    <h1 class="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
    <p class="text-xl mb-8 text-muted-foreground">We apologize for the inconvenience.</p>
    <div class="flex space-x-4">
      <a [routerLink]="['/']" class="btn btn-outline text-neutral-700 border-neutral-300 rounded-lg hover:text-neutral-700  hover:bg-neutral-200 transition">
          <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          Go to Homepage
      </a>
    </div>
  </div>
    `
 })
export class ErrorComponent { }
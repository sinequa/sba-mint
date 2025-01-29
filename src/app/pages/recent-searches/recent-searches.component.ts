import { Component, effect, inject } from '@angular/core';
import { UserSettingsStore } from '@sinequa/atomic-angular';
import { NavbarComponent } from "../../../core/components/navbar/navbar.component";

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <app-navbar class="mt-4" />

    <div class="layout-search">
      <div class="col-start-2 col-span-2">
        <h1 class="flex gap-2 mt-6 mb-4 text-2xl font-semibold">
          <i class="fa-fw far fa-clock-rotate-left" aria-hidden></i>
          History
          <!-- {{ 'history' | transloco }} -->
        </h1>

        
      </div>
    </div>
  `,
  styles: ``
})
export class RecentSearchesComponent {
  readonly userSettingsStore = inject(UserSettingsStore);

  constructor() {
    effect(() => {
      console.log(this.userSettingsStore.recentSearches());
    });
  }
}

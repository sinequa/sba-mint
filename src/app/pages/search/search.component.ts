import { Component, effect, inject, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { QueryParamsStore } from '@sinequa/atomic-angular';

import { NavbarComponent } from '@/core/components/navbar/navbar.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './search.component.html',
  host: {
    class: 'flex flex-col h-screen w-screen'
  }
})
export class SearchComponent {
  protected readonly queryParamsStore = inject(QueryParamsStore);

  // input url bindings
  q = input<string>(); // text
  t = input<string>(); // tab
  s = input<string>(); // sort
  f = input<string>(); // filters

  constructor() {
    // Update the query params store with the filters from the query params
    effect(() => {
      const filters = JSON.parse(this.f() ?? '[]'); // Parse the filters from the query params
      this.queryParamsStore.updateFilter(filters);
      this.queryParamsStore.patch({ text: this.q(), tab: this.t(), sort: this.s() });
    }, { allowSignalWrites: true });
  }
}

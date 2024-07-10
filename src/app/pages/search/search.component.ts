import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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

  // input url bindings
  q = input<string>(); // text
  t = input<string>(); // tab
  s = input<string>(); // sort
  f = input<string>(); // filters

  constructor() { }
}

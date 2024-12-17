import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


import { NavbarComponent } from '@/core/components/navbar/navbar.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './search.component.html',
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class SearchComponent { }

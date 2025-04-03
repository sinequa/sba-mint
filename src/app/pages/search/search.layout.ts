import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageHeaderComponent } from '@sinequa/ui';

import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterOutlet, PageHeaderComponent, NavbarComponent],
  templateUrl: './search.layout.html',
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class SearchLayoutComponent {}

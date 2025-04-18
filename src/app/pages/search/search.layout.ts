import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageHeaderComponent } from '@sinequa/ui';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { provideTranslocoScope } from '@jsverse/transloco';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-search',
  imports: [RouterOutlet, PageHeaderComponent, NavbarComponent, AppSidebarComponent],
  templateUrl: './search.layout.html',
  host: {
    class: 'flex flex-col h-full w-full'
  },
  providers: [provideTranslocoScope('bookmarks', 'saved-searches', 'recent-searches', 'collections', 'alerts')]
})
export class SearchLayoutComponent {}

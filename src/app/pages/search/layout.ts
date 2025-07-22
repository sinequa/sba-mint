import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageHeaderComponent } from '../../ui/page-header/page-header';

@Component({
  selector: 'app-search-layout',
  imports: [RouterOutlet, PageHeaderComponent, NavbarComponent, AppSidebarComponent],
  template: `
    <app-sidebar class="fixed top-0 h-full" />

    <PageHeader class="h-20" position="fixed">
      <app-navbar class="layout-search py-4" />
    </PageHeader>

    <div class="mt-20">
      <router-outlet />
    </div>
  `,
  host: {
    class: 'flex flex-col h-full w-full'
  },
  providers: [provideTranslocoScope('bookmarks', 'saved-searches', 'recent-searches', 'collections', 'alerts')]
})
export class SearchLayoutComponent {}

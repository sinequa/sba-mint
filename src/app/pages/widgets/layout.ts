import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { provideTranslocoScope } from '@jsverse/transloco';
import { PageHeaderComponent } from '@sinequa/ui';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'widgets-layout',
  imports: [RouterOutlet, PageHeaderComponent, NavbarComponent, AppSidebarComponent],
  template: `
    <app-sidebar class="fixed top-0 h-full" />

    <PageHeader>
      <app-navbar class="layout-search py-4" />
    </PageHeader>

    <div class="mt-16">
      <router-outlet />
    </div>
  `,
  host: {
    class: 'flex flex-col h-full w-full'
  },
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections', 'alerts')]
})
export class WidgetsLayoutComponent {}

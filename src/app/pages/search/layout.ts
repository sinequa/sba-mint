import { Component, DestroyRef, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { ApplicationService, DrawerStackService, SelectionStore } from '@sinequa/atomic-angular';
import { PageHeaderComponent } from '@sinequa/ui';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';

/**
 * Layout component for the search page.
 * It includes a sidebar, a page header with a navbar, and a router outlet for displaying the main content.
 * @deprecated This layout is deprecated and will be removed in future versions.
 */
@Component({
  selector: 'app-search-layout',
  imports: [RouterOutlet, PageHeaderComponent, NavbarComponent, AppSidebarComponent],
  template: `
    <app-sidebar class="fixed top-0 h-full" />

    <PageHeader class="z-20">
      <app-navbar class="layout-search py-4" />
    </PageHeader>

    <div class="mt-16">
      <router-outlet />
    </div>
  `,
  host: {
    class: 'flex flex-col h-full w-full'
  },
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections', 'alerts', 'sort-selector', 'article')]
})
export class SearchLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore, { optional: true });

  private readonly applicationService = inject(ApplicationService);
  private readonly drawerStackService = inject(DrawerStackService);

  constructor() {
    this.destroyRef.onDestroy(() => this.selectionStore?.clearMultiSelection());

    // react to drawer state changes to update the application title when the drawer is closed
    effect(() => {
      if (!this.drawerStackService.isOpened()) {
        this.applicationService.setTitle('Search');
      }
    });
  }
}

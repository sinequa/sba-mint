import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { SelectionStore } from '@sinequa/atomic-angular';
import { SidebarProviderComponent, SidebarTriggerComponent } from '@sinequa/ui';

import { SearchWithAutocompleteComponent } from '@components/search/search-with-autocomplete';
import { SidebarMainComponent } from '@components/sidebar/sidebar';
import { WidgetsSidebarGroupComponent } from '@components/widgets/widgets-sidebar-group';

@Component({
  selector: 'app-search-layout',
  imports: [
    RouterOutlet,
    SidebarMainComponent,
    SidebarTriggerComponent,
    SidebarProviderComponent,
    WidgetsSidebarGroupComponent,
    SearchWithAutocompleteComponent
  ],
  template: `
    <sidebar-provider>
      <main-sidebar triggerName="sidebar-search">
        <!-- sidebar extras -->
        <widgets-sidebar-group slot="sidebar-extras" />

        <!-- sidebar-inset content -->
        <nav class="bg-background sticky top-0 z-2 grid grid-cols-[.15fr_auto] rounded p-4 md:grid-cols-[.15fr_auto_.15fr] lg:grid-cols-[.25fr_auto_.25fr]">
          <sidebar-trigger />
          <search-with-autocomplete class="w-full" />
        </nav>
        <div class="sm:m-auto sm:w-[90%] xl:w-[60%]">
          <div class="mx-2 flex flex-col">
            <router-outlet />
          </div>
        </div>
      </main-sidebar>
    </sidebar-provider>
  `,
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections', 'alerts', 'sort-selector', 'article')]
})
export class SearchLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore, { optional: true });

  constructor() {
    this.destroyRef.onDestroy(() => this.selectionStore?.clearMultiSelection());
  }
}

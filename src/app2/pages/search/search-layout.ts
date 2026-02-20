import { Component, DestroyRef, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchWithAutocompleteComponent } from '@components/search/search-with-autocomplete';
import { SidebarMainComponent } from '@components/sidebar/sidebar';
import { WidgetsSidebarGroupComponent } from '@components/widgets/widgets-sidebar-group';
import { provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { ApplicationService, SelectionStore } from '@sinequa/atomic-angular';
import { SidebarProviderComponent, SidebarTriggerComponent } from '@sinequa/ui';

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
        <nav class="sticky top-0 z-2 grid grid-cols-[.15fr_auto] rounded bg-background p-4 md:grid-cols-[.15fr_auto_.15fr] lg:grid-cols-[.25fr_auto_.25fr]">
          <sidebar-trigger />
          <search-with-autocomplete class="w-full" />
        </nav>
        <router-outlet />
      </main-sidebar>
    </sidebar-provider>
  `,
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections', 'alerts', 'sort-selector', 'article', 'filters')]
})
export class SearchLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore);
  private readonly applicationService = inject(ApplicationService);

  constructor() {
    // react to drawer state changes to update the application title when the drawer is closed
    effect(() => {
      const { id } = getState(this.selectionStore);
      if (!id) {
        this.applicationService.setTitle('Search');
      }
    });

    this.destroyRef.onDestroy(() => this.selectionStore?.clearMultiSelection());
  }
}

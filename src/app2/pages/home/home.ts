import { Component, effect, inject, Injector, runInInjectionContext, signal } from '@angular/core';
import { SheetPreviewerComponent } from '@components/preview/sheet-previewer';
import { SearchWithAutocompleteComponent } from '@components/search/search-with-autocomplete';
import { SidebarMainComponent } from '@components/sidebar/sidebar';
import { WidgetsTabsComponent } from '@components/widgets/widgets-tabs';
import { provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { error, fetchQuery } from '@sinequa/atomic';
import { AggregationsStore, ApplicationService, AppStore, KeyboardNavigatorOptions, SelectionStore, signIn } from '@sinequa/atomic-angular';
import { SidebarProviderComponent, SidebarTriggerComponent } from '@sinequa/ui';

@Component({
  selector: 'app-home',
  imports: [
    SidebarMainComponent,
    WidgetsTabsComponent,
    SearchWithAutocompleteComponent,
    SidebarTriggerComponent,
    SidebarProviderComponent,
    SheetPreviewerComponent
  ],
  templateUrl: './home.html',
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections')]
})
export class HomeComponent {
  readonly injector = inject(Injector);
  readonly appStore = inject(AppStore);
  readonly applicationService = inject(ApplicationService);
  readonly aggregationStore = inject(AggregationsStore);
  readonly selectionStore = inject(SelectionStore);

  navigatorOptions = signal<KeyboardNavigatorOptions>({
    name: 'tabsNavigator',
    optionSelector: '[role="tab"]:not([aria-disabled="true"])',
    direction: 'horizontal',
    selectOnFocus: true,
    resetSelectionOnBlur: true
  });

  defaultUserFeatures = {
    bookmarks: true,
    recentSearches: true,
    savedSearches: true
  };

  constructor() {
    // Set the page title to "Home" if no preview is open (i.e., no selection in the selection store)
    effect(() => {
      const { id } = getState(this.selectionStore);
      if (!id) {
        this.applicationService.setTitle('Home');
      }
    });

    // this is needed to populate the aggregation with the sources as no query is sent to the server
    this.getFirstPageQuery();
  }

  async getFirstPageQuery() {
    try {
      const query = this.appStore.getDefaultQuery() || { name: '_default' };
      const response = await fetchQuery({ isFirstPage: true, name: query.name });
      this.aggregationStore.update(response.aggregations);
    } catch (err: any) {
      if (err.status === 401) {
        error('Unauthorized access - please check your credentials:', err);
        runInInjectionContext(this.injector, () => signIn());
      } else if (err.status === 404) {
        console.log('404 Not Found!');
      } else {
        console.log(`HTTP error: ${err.status}`);
      }
    }
  }
}

import { Component, computed, DestroyRef, effect, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SearchWithAutocompleteComponent } from "@components/search/search-with-autocomplete";
import { ApplicationService, SelectionStore } from "@sinequa/atomic-angular";
import { BreakpointObserverService } from "@sinequa/ui";

@Component({
  selector: "app-search-layout",
  template: `
  <!-- sidebar-inset content -->
  <nav class="sticky top-0 z-2 rounded bg-background p-4" [class.mt-14]="isMobile()">
    <search-with-autocomplete class="w-full" />
  </nav>
  <router-outlet />
  `,
  imports: [RouterModule, SearchWithAutocompleteComponent]
})
export class SearchLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore);
  private readonly applicationService = inject(ApplicationService);
  private readonly breakpointService = inject(BreakpointObserverService);

  isMobile = computed(() => this.breakpointService.isMobile());

  constructor() {
    effect(() => {
      const id = this.selectionStore.id?.();
      if (!id) {
        this.applicationService.setTitle("Search");
      }
    });

    this.destroyRef.onDestroy(() => this.selectionStore?.clearMultiSelection());
  }
}

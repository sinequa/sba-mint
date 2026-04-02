import { Component, DestroyRef, effect, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ApplicationService, SelectionStore } from "@sinequa/atomic-angular";

@Component({
  selector: "app-search-layout",
  template: `
  <router-outlet />
  `,
  imports: [RouterModule]
})
export class SearchLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore);
  private readonly applicationService = inject(ApplicationService);

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

import { Component, DestroyRef, effect, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { translateSignal } from "@jsverse/transloco";
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
  // Reactive translated title: empty string until the async translation file loads,
  // then re-emitted on every language change. translateSignal wraps selectTranslate,
  // so the raw key never flashes on first load.
  private readonly pageTitle = translateSignal("pageTitle.search");

  constructor() {
    effect(() => {
      const id = this.selectionStore.id?.();
      const title = this.pageTitle();
      if (!id && title) {
        this.applicationService.setTitle(title);
      }
    });

    this.destroyRef.onDestroy(() => this.selectionStore?.clearMultiSelection());
  }
}

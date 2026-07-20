import { Component, DestroyRef, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterModule } from "@angular/router";
import { TranslocoService } from "@jsverse/transloco";
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
  private readonly transloco = inject(TranslocoService);
  // Emits the translated title once the (async) translation file is loaded, and again on each
  // language change. Using selectTranslate (not translate) avoids showing the raw key on first load.
  private readonly pageTitle = toSignal(this.transloco.selectTranslate("pageTitle.search"));

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

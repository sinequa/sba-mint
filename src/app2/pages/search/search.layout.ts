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
  // Translated tab title via the service's selectTranslate — NOT the translateSignal helper, which
  // auto-injects any active provideTranslocoScope and would resolve the key in the wrong namespace.
  // selectTranslate waits for the async file (no raw-key flash) and re-emits on language change.
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

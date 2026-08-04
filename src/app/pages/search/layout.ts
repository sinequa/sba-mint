import { Component, DestroyRef, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterOutlet } from "@angular/router";
import { provideTranslocoScope, TranslocoService } from "@jsverse/transloco";

import { ApplicationService, DrawerStackService, SelectionStore } from "@sinequa/atomic-angular";
import { PageHeaderComponent } from "@sinequa/ui";

import { NavbarComponent } from "../../components/navbar/navbar.component";
import { AppSidebarComponent } from "../../components/sidebar/sidebar.component";

/**
 * Layout component for the search page.
 * It includes a sidebar, a page header with a navbar, and a router outlet for displaying the main content.
 * @deprecated This layout is deprecated and will be removed in future versions.
 */
@Component({
  selector: "app-search-layout",
  imports: [RouterOutlet, PageHeaderComponent, NavbarComponent, AppSidebarComponent],
  template: `
    <app-sidebar class="fixed top-0 h-full" />

    <PageHeader class="z-20">
      <app-navbar class="layout-search py-4" />
    </PageHeader>

    <div class="mt-16 ml-12">
      <router-outlet />
    </div>
  `,
  host: {
    class: "flex flex-col h-full w-full"
  },
  providers: [provideTranslocoScope("bookmarks", "searches", "collections", "alerts", "sort-selector", "article")]
})
export class SearchLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectionStore = inject(SelectionStore, { optional: true });

  private readonly applicationService = inject(ApplicationService);
  private readonly drawerStackService = inject(DrawerStackService);
  private readonly transloco = inject(TranslocoService);
  // Translated tab title via the service's selectTranslate — NOT the translateSignal helper, which
  // auto-injects this component's provideTranslocoScope and would resolve the key in the wrong
  // namespace. selectTranslate waits for the async file (no raw-key flash) and re-emits on language
  // change. (Search route is not reused, so a reactive effect is safe here.)
  private readonly pageTitle = toSignal(this.transloco.selectTranslate("pageTitle.search"));

  constructor() {
    this.destroyRef.onDestroy(() => this.selectionStore?.clearMultiSelection());

    // react to drawer state changes to update the application title when the drawer is closed.
    // Reading pageTitle() (a translated signal) also re-runs this on language change.
    effect(() => {
      const title = this.pageTitle();
      if (!this.drawerStackService.isOpened() && title) {
        this.applicationService.setTitle(title);
      }
    });
  }
}

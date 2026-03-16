import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AppStore, QueryParamsStore } from "@sinequa/atomic-angular";
import {
  SidebarGroupComponent,
  SidebarGroupContentComponent,
  SidebarGroupLabelComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent
} from "@sinequa/ui";

@Component({
  selector: "app-sidebar-group-navigation",
  template: `
    <sidebar-group class="px-3 py-3">
      <sidebar-group-label>Navigation</sidebar-group-label>
      <sidebar-group-content>
        <sidebar-menu>
          <sidebar-menu-item aria-label="Search">
            <sidebar-menu-button
              class="text-lg"
              routerLink="/home"
              routerLinkActive="active"
              #rlaHome="routerLinkActive"
              [attr.data-active]="rlaHome.isActive || null">
              <i tooltip="Home" tooltip-position="right" class="fa-fw far fa-home" aria-hidden="true"></i>
              <span class="text-sm" sr-only>Home</span>
            </sidebar-menu-button>
          </sidebar-menu-item>

          @if (allowEmptySearch()) {
            <sidebar-menu-item aria-label="Search">
              <sidebar-menu-button
                class="text-lg"
                routerLink="/search"
                routerLinkActive="active"
                #rlaSearch="routerLinkActive"
                [attr.data-active]="rlaSearch.isActive || null">
                <i tooltip="Search" tooltip-position="right" class="fa-fw far fa-magnifying-glass" aria-hidden="true"></i>
                <span class="text-sm" sr-only>Search</span>
              </sidebar-menu-button>
            </sidebar-menu-item>
          }

          <ng-content />

        </sidebar-menu>
      </sidebar-group-content>
    </sidebar-group>
  `,
  imports: [
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    SidebarGroupContentComponent,
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarMenuButtonComponent,
    RouterLink,
    RouterLinkActive
  ],
  host: {
    class: "contents"
  }
})
export class SidebarGroupNavigationComponent {
  private readonly appStore = inject(AppStore);
  private readonly queryParamsStore = inject(QueryParamsStore);

  allowEmptySearch = computed(() => this.appStore.allowEmptySearch(this.queryParamsStore.getQuery()?.name ?? ''));
}

import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AppStore, QueryParamsStore } from "@sinequa/atomic-angular";
import {
  SidebarGroupComponent,
  SidebarGroupContentComponent,
  SidebarGroupLabelComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent,
  useSidebar
} from "@sinequa/ui";
import { injectCurrentUrl } from "../../utils/routing";
import { WidgetsSidebarGroupComponent } from "./sidebar-group-widgets";

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
              [attr.data-active]="rlaHome.isActive || null"
              (click)="closeSidebarOnMobile()">
              <i tooltip="Home" tooltip-position="right" class="fa-fw far fa-home" aria-hidden="true"></i>
              <span class="text-sm" sr-only>Home</span>
            </sidebar-menu-button>
          </sidebar-menu-item>

          @if (allowEmptySearch() ||isSearchRoute()) {
            <sidebar-menu-item aria-label="Search">
              <sidebar-menu-button
                class="text-lg"
                routerLink="/search"
                routerLinkActive="active"
                #rlaSearch="routerLinkActive"
                [attr.data-active]="rlaSearch.isActive || null"
                (click)="closeSidebarOnMobile()">
                <i tooltip="Search" tooltip-position="right" class="fa-fw far fa-magnifying-glass" aria-hidden="true"></i>
                <span class="text-sm" sr-only>Search</span>
              </sidebar-menu-button>
            </sidebar-menu-item>
          }

          @if(isSearchRoute()) {
            <!-- other sidebar groups can be added here -->
            <app-sidebar-group-widgets />
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
    RouterLinkActive,
    WidgetsSidebarGroupComponent
  ],
  host: {
    class: "contents"
  }
})
export class SidebarGroupNavigationComponent {
  private readonly appStore = inject(AppStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  readonly sidebar = useSidebar();

  allowEmptySearch = computed(() => this.appStore.allowEmptySearch(this.queryParamsStore.getQuery()?.name ?? ""));

  private readonly currentUrl = injectCurrentUrl();

  readonly isSearchRoute = computed(() => this.currentUrl()?.startsWith("/search") ?? false);

  closeSidebarOnMobile() {
    if (this.sidebar.isMobile()) {
      this.sidebar.setOpenMobile(false);
    }
  }
}

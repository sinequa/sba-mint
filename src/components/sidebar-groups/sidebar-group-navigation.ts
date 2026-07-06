import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AppStore, QueryParamsStore } from "@sinequa/atomic-angular";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  SidebarGroupComponent,
  SidebarGroupContentComponent,
  SidebarGroupLabelComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent,
  TooltipDirective
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
              [tooltip]="'home' | transloco" tooltip-position="right"
              class="text-lg"
              routerLink="/home"
              routerLinkActive="active"
              #rlaHome="routerLinkActive"
              [attr.data-active]="rlaHome.isActive || null">
              <home-icon />
              <span class="text-sm" sr-only>{{ 'home' | transloco }}</span>
            </sidebar-menu-button>
          </sidebar-menu-item>

          @if (allowEmptySearch() ||isSearchRoute()) {
            <sidebar-menu-item aria-label="Search">
              <sidebar-menu-button
                [tooltip]="'search' | transloco" tooltip-position="right"
                class="text-lg"
                routerLink="/search"
                routerLinkActive="active"
                #rlaSearch="routerLinkActive"
                queryParamsHandling="preserve"
                [attr.data-active]="rlaSearch.isActive || null">
                <magnifying-glass-icon />
                <span class="text-sm" sr-only>{{ 'search' | transloco }}</span>
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
    WidgetsSidebarGroupComponent,
    TranslocoPipe,
    TooltipDirective,
    HomeIcon,
    MagnifyingGlassIcon
  ],
  host: {
    class: "contents"
  }
})
export class SidebarGroupNavigationComponent {
  private readonly appStore = inject(AppStore);
  private readonly queryParamsStore = inject(QueryParamsStore);

  allowEmptySearch = computed(() => this.appStore.allowEmptySearch(this.queryParamsStore.getQuery()?.name ?? ""));

  private readonly currentUrl = injectCurrentUrl();

  readonly isSearchRoute = computed(() => this.currentUrl()?.startsWith("/search") ?? false);
}

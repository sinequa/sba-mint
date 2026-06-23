import { NgComponentOutlet } from "@angular/common";
import { Component, computed, inject, signal, Type } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { EventType, NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AlertsComponent, BookmarksComponent, CollectionsComponent, RecentSearchesComponent, SavedSearchesComponent } from "@sinequa/atomic-angular";
import {
  ArrowUpRightFromSquareIcon,
  BellIcon,
  BookmarkIcon,
  BreakpointObserverService,
  DropdownComponent,
  DropdownContentComponent,
  HistoryIcon,
  InboxIcon,
  PopoverComponent,
  PopoverContentComponent,
  SidebarGroupComponent,
  SidebarGroupContentComponent,
  SidebarGroupLabelComponent,
  SidebarMenuActionComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent,
  SidebarService,
  StarIcon,
  TooltipDirective
} from "@sinequa/ui";
import { filter, map, startWith } from "rxjs";

export type NavbarMenu = {
  name: string;
  display: string;
  icon: Type<unknown>;
  routerLink?: string;
  keepOnMouseLeave?: boolean;
  component: Type<unknown>;
};

/**
 * Widgets sidebar group component
 * Usage:
 * ```html
 * <widgets-sidebar-group></widgets-sidebar-group>
 * ```
 * This component displays a sidebar group containing various widget menus such as recent searches,
 * bookmarks, collections, saved searches, and alerts. Each menu item can either navigate to a dedicated route
 * or open a dropdown/popover with the corresponding component based on the device type (mobile or desktop).
 *
 */
@Component({
  selector: "widgets-sidebar-group,app-sidebar-group-widgets",
  template: `
  @if(showWidgetsGroup()){
    <sidebar-group>
      <sidebar-group-label>Widgets</sidebar-group-label>
      <sidebar-group-content>
        <sidebar-menu>
          @for (menu of menus(); track menu.name) {
            @let isMobile = breakpointService.isMobile();
            <sidebar-menu-item [attr.aria-label]="menu.display | transloco">
              @if (isMobile) {
                <!-- On mobile, navigate to a dedicated route -->
                @if (menu.name !== "alerts") {
                  <sidebar-menu-button
                    class="text-lg"
                    [routerLink]="menu.routerLink"
                    routerLinkActive="active"
                    #rla="routerLinkActive"
                    [attr.data-active]="rla.isActive || null">
                    <span [tooltip]="menu.display | transloco" tooltip-position="right" aria-hidden="true">
                      <ng-container *ngComponentOutlet="menu.icon" />
                    </span>
                    <span class="text-sm" sr-only>{{ menu.display | transloco }}</span>
                  </sidebar-menu-button>
                }
              } @else if (menu.name === "alerts") {
                <Popover class="w-full rounded-lg border-neutral-300">
                  <sidebar-menu-button class="text-lg">
                    <span [tooltip]="menu.display | transloco" tooltip-position="right" aria-hidden="true">
                      <ng-container *ngComponentOutlet="menu.icon" />
                    </span>
                    <span class="text-sm" sr-only>{{ menu.display | transloco }}</span>
                  </sidebar-menu-button>
                  <PopoverContent class="w-95 max-w-md min-w-sm" strategy="fixed" position="right-start">
                    <ng-container [ngComponentOutlet]="menu.component"></ng-container>
                  </PopoverContent>
                </Popover>
              } @else {
                <Dropdown class="w-full rounded-lg border-neutral-300">
                  <sidebar-menu-button class="text-lg" [attr.data-active]="rla.isActive || null">
                    <span [tooltip]="menu.display | transloco" tooltip-position="right" aria-hidden="true">
                      <ng-container *ngComponentOutlet="menu.icon" />
                    </span>
                    <span class="text-sm" sr-only>{{ menu.display | transloco }}</span>
                  </sidebar-menu-button>
                  <DropdownContent class="w-95 max-w-md min-w-sm" strategy="fixed" position="right-start">
                    <ng-container [ngComponentOutlet]="menu.component"></ng-container>
                  </DropdownContent>
                </Dropdown>
                <sidebar-menu-action [routerLink]="menu.routerLink" routerLinkActive="active" #rla="routerLinkActive">
                  <arrow-up-right-from-square-icon />
                  <span class="sr-only">Move to {{ menu.display | transloco }}</span>
                </sidebar-menu-action>
              }
            </sidebar-menu-item>
          }
        </sidebar-menu>
      </sidebar-group-content>
    </sidebar-group>
  }
  `,
  imports: [
    TranslocoPipe,
    TooltipDirective,
    RouterLink,
    RouterLinkActive,
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarMenuButtonComponent,
    NgComponentOutlet,
    DropdownContentComponent,
    DropdownComponent,
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    SidebarGroupContentComponent,
    PopoverComponent,
    PopoverContentComponent,
    SidebarMenuActionComponent,
    ArrowUpRightFromSquareIcon
  ]
})
export class WidgetsSidebarGroupComponent {
  protected readonly menus = signal<NavbarMenu[]>([
    {
      name: "recent-searches",
      display: "searches.recent.label",
      icon: HistoryIcon,
      routerLink: "/widgets/recent-searches",
      component: RecentSearchesComponent
    },
    {
      name: "bookmarks",
      display: "bookmarks.label",
      icon: BookmarkIcon,
      routerLink: "/widgets/bookmarks",
      component: BookmarksComponent
    },
    {
      name: "collections",
      display: "collections.label",
      icon: InboxIcon,
      routerLink: "/widgets/collections",
      component: CollectionsComponent
    },
    {
      name: "saved-searches",
      display: "searches.saved.label",
      icon: StarIcon,
      routerLink: "/widgets/saved-searches",
      component: SavedSearchesComponent
    },
    { name: "alerts", display: "alerts.label", icon: BellIcon, component: AlertsComponent }
  ]);

  private readonly router = inject(Router);
  protected readonly breakpointService = inject(BreakpointObserverService);
  private readonly sidebarService = inject(SidebarService);

  constructor() {
    // Close the sidebar in mobile after navigation
    this.router.events.pipe(
      filter(e => e.type === EventType.NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      if (this.breakpointService.isMobile()) {
        this.sidebarService.setOpenMobile(false);
      }
    });
  }

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    )
  );

  readonly showWidgetsGroup = computed(() => {
    const url = this.currentUrl() ?? "";
    return url.startsWith("/search") || url.startsWith("/widgets");
  });
}

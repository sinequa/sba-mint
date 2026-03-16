import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { SavedChatComponent } from "@sinequa/agent";
import {
  SidebarGroupComponent,
  SidebarGroupLabelComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent,
  SidebarSeparatorComponent,
  TooltipDirective,
  useSidebar
} from "@sinequa/ui";
import { filter, map, startWith } from "rxjs";

@Component({
  selector: "app-sidebar-group-agent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sidebar-menu>
      <sidebar-menu-item aria-label="Agent">
        <sidebar-menu-button
          class="text-lg"
          routerLink="/agent"
          routerLinkActive="active"
          #rla2="routerLinkActive"
          [attr.data-active]="rla2.isActive || null">
          <i tooltip="Agent" tooltip-position="right" class="fa-fw far fa-robot [&>svg]:h-5 [&>svg]:w-5" aria-hidden="true"></i>
          <span class="text-sm" sr-only>Agent</span>
        </sidebar-menu-button>
      </sidebar-menu-item>
    </sidebar-menu>

    @if (isAgentRoute()) {
    <sidebar-group class="px-3 py-3">
      <sidebar-menu class="gap-2">
        <sidebar-group class="p-0">
          <!--new chat-->
          <sidebar-menu-item class="group-data-[collapsible=icon]:items-center"
            routerLink="/chat"
          >
            <sidebar-menu-button
              [tooltip]="isCollapsed() ? 'New chat' : ''"
              tooltip-position="right">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10.0387 21.6338L13.4849 19.2H17.9999C19.9874 19.2 21.5999 17.5875 21.5999 15.6V7.20001C21.5999 5.21251 19.9874 3.60001 17.9999 3.60001H5.9999C4.0124 3.60001 2.3999 5.21251 2.3999 7.20001V15.6C2.3999 17.5875 4.0124 19.2 5.9999 19.2H7.1999V21.9C7.1999 22.2375 7.3874 22.545 7.6874 22.6988C7.9874 22.8525 8.3474 22.83 8.62115 22.635L10.0387 21.6338ZM13.4849 17.4C13.1137 17.4 12.7499 17.5163 12.4462 17.73C11.3737 18.4875 10.2224 19.2975 8.9999 20.1638V18.3C8.9999 18.195 8.98115 18.09 8.9474 17.9963C8.82365 17.6475 8.4899 17.4 8.0999 17.4H5.9999C5.00615 17.4 4.1999 16.5938 4.1999 15.6V7.20001C4.1999 6.20626 5.00615 5.40001 5.9999 5.40001H17.9999C18.9937 5.40001 19.7999 6.20626 19.7999 7.20001V15.6C19.7999 16.5938 18.9937 17.4 17.9999 17.4H13.4849ZM11.9999 7.80001C11.5012 7.80001 11.0999 8.20126 11.0999 8.70001V10.5H9.2999C8.80115 10.5 8.3999 10.9013 8.3999 11.4C8.3999 11.8988 8.80115 12.3 9.2999 12.3H11.0999V14.1C11.0999 14.5988 11.5012 15 11.9999 15C12.4987 15 12.8999 14.5988 12.8999 14.1V12.3H14.6999C15.1987 12.3 15.5999 11.8988 15.5999 11.4C15.5999 10.9013 15.1987 10.5 14.6999 10.5H12.8999V8.70001C12.8999 8.20126 12.4987 7.80001 11.9999 7.80001Z"
                  fill="currentColor" />
              </svg>
              <span>New Chat</span>
            </sidebar-menu-button>
          </sidebar-menu-item>
          <!--search chats-->
          <sidebar-menu-item class="group-data-[collapsible=icon]:items-center">
            <sidebar-menu-button [tooltip]="isCollapsed() ? 'Search chats' : ''" tooltip-position="right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10.8001 6.8001C10.8001 4.5901 9.0101 2.8001 6.8001 2.8001C4.5901 2.8001 2.8001 4.5901 2.8001 6.8001C2.8001 9.0101 4.5901 10.8001 6.8001 10.8001C9.0101 10.8001 10.8001 9.0101 10.8001 6.8001ZM10.0276 10.8776C9.1426 11.5801 8.0201 12.0001 6.8001 12.0001C3.9276 12.0001 1.6001 9.6726 1.6001 6.8001C1.6001 3.9276 3.9276 1.6001 6.8001 1.6001C9.6726 1.6001 12.0001 3.9276 12.0001 6.8001C12.0001 8.0201 11.5801 9.1426 10.8776 10.0276L14.2251 13.3751C14.4601 13.6101 14.4601 13.9901 14.2251 14.2226C13.9901 14.4551 13.6101 14.4576 13.3776 14.2226L10.0276 10.8776Z"
                  fill="currentColor" />
              </svg>
              <span>Search Chats</span>
            </sidebar-menu-button>
          </sidebar-menu-item>
          <!--worksets-->
          <sidebar-menu-item class="group-data-[collapsible=icon]:items-center">
            <sidebar-menu-button [tooltip]="isCollapsed() ? 'Worksets' : ''" tooltip-position="right">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="12" viewBox="0 0 15 12" fill="none">
                <path
                  d="M12.8 8.4H4C3.78 8.4 3.6 8.22 3.6 8V1.6C3.6 1.38 3.78 1.2 4 1.2H6.9375C7.0425 1.2 7.145 1.2425 7.22 1.3175L8.1175 2.215C8.4925 2.59 9.0025 2.8 9.5325 2.8H12.8C13.02 2.8 13.2 2.98 13.2 3.2V8C13.2 8.22 13.02 8.4 12.8 8.4ZM4 9.6H12.8C13.6825 9.6 14.4 8.8825 14.4 8V3.2C14.4 2.3175 13.6825 1.6 12.8 1.6H9.5325C9.32 1.6 9.1175 1.515 8.9675 1.365L8.0675 0.4675C7.7675 0.1675 7.3625 0 6.9375 0H4C3.1175 0 2.4 0.7175 2.4 1.6V8C2.4 8.8825 3.1175 9.6 4 9.6ZM1.2 3C1.2 2.6675 0.9325 2.4 0.6 2.4C0.2675 2.4 0 2.6675 0 3V10.4C0 11.2825 0.7175 12 1.6 12H11.4C11.7325 12 12 11.7325 12 11.4C12 11.0675 11.7325 10.8 11.4 10.8H1.6C1.38 10.8 1.2 10.62 1.2 10.4V3Z"
                  fill="currentColor" />
              </svg>
              <span>Worksets</span>
            </sidebar-menu-button>
          </sidebar-menu-item>
        </sidebar-group>

        <sidebar-separator class="mx-0 group-data-[collapsible=icon]:hidden" />

        <sidebar-group-label>Today</sidebar-group-label>
        @if (showSavedChats()) {
          <SavedChat class="gap-3 p-2 empty:hidden" />
        }
      </sidebar-menu>
    </sidebar-group>
    }
  `,
  imports: [
    SidebarGroupComponent,
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarMenuButtonComponent,
    TooltipDirective,
    SidebarSeparatorComponent,
    SidebarGroupLabelComponent,
    SavedChatComponent,
    RouterLink,
    RouterLinkActive
  ],
  host: {
    class: "contents"
  }
})
export class SidebarGroupAgentComponent {
  readonly sidebar = useSidebar();
  private readonly router = inject(Router);
  showSavedChats = signal(false);

  readonly isCollapsed = computed(() => this.sidebar.state() === "collapsed");

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    )
  );

  readonly isAgentRoute = computed(() => this.currentUrl()?.startsWith("/agent") ?? false);
}

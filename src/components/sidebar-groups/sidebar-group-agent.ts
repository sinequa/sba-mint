import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AGENT_INSTANCE_ID, AgentsStore, createAgentNewChatEvent, SavedChatComponent } from "@sinequa/agent";
import { AppStore } from "@sinequa/atomic-angular";
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
import { injectCurrentUrl } from "@utils/routing";

@Component({
  selector: "app-sidebar-group-agent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  @if(allowAgent()) {
    <sidebar-menu>
      <sidebar-menu-item aria-label="Agent">
        <sidebar-menu-button
          class="text-lg"
          routerLink="/chat/new"
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
          <sidebar-menu-item class="group-data-[collapsible=icon]:items-center">
            <sidebar-menu-button
              routerLink="/chat/new"
              (click)="startNewChat()"
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
        </sidebar-group>

        <sidebar-separator class="mx-0 group-data-[collapsible=icon]:hidden" />

        <sidebar-group-label>Today</sidebar-group-label>
        @if (showSavedChats()) {
          <SavedChat class="gap-3 p-2 empty:hidden" />
        }
      </sidebar-menu>
    </sidebar-group>
    }
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

  private readonly appStore = inject(AppStore);
  private readonly agentsStore = inject(AgentsStore);

  protected readonly showSavedChats = computed(() => this.agentsStore.getAgentInstanceConfiguration(this.instanceId)?.savedChatSettings?.display === true);

  readonly isCollapsed = computed(() => this.sidebar.state() === "collapsed");

  private readonly instanceId = inject(AGENT_INSTANCE_ID);
  protected readonly allowAgent = computed(() => {
    return !!this.appStore.isAgentAllowed(this.instanceId);
  });

  private readonly currentUrl = injectCurrentUrl();
  readonly isAgentRoute = computed(() => this.currentUrl()?.startsWith("/chat") ?? false);

  startNewChat() {
    const event = createAgentNewChatEvent(this.instanceId);
    document.dispatchEvent(event);
  }
}

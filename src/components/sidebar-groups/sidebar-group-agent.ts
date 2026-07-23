import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AGENT_INSTANCE_ID, AgentsStore, createAgentNewChatEvent, SavedChatsDialogComponent } from "@sinequa/agent";
import { error } from "@sinequa/atomic";
import { AppStore } from "@sinequa/atomic-angular";
import {
  MagnifyingGlassIcon,
  NewChatIcon,
  RobotIcon,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarMenuItemComponent,
  TooltipDirective,
  useSidebar
} from "@sinequa/ui";
import { injectCurrentUrl } from "../../utils/routing";

@Component({
  selector: "app-sidebar-group-agent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  @if (allowAgent()) {
    <sidebar-menu>
      @let agent = 'agent' | transloco;
      <!-- Agent parent entry (mirrors the Search parent entry). -->
      <sidebar-menu-item aria-label="agent" class="group-data-[collapsible=icon]:items-center">
        <sidebar-menu-button [tooltip]="isCollapsed() ? agent : ''" tooltip-position="right" class="text-lg" routerLink="/chat/new" routerLinkActive="active" #rla2="routerLinkActive" [attr.data-active]="rla2.isActive || null">
          <robot-icon />
          <span class="text-sm">{{ agent }}</span>
        </sidebar-menu-button>
      </sidebar-menu-item>

      <!-- Sub-entries, only while on the agent route (mirrors the Search widgets pattern).
           The saved-chats history is rendered separately by <app-sidebar-group-agent-history>
           so it gets its own scroll region (like the demo). -->
      @if (isAgentRoute()) {
        @let newChat = 'newChat' | transloco;
        <sidebar-menu-item
          class="group-data-[collapsible=icon]:items-center"
          [attr.aria-label]="newChat"
          [class.cursor-pointer]="isIdle()"
          [class.cursor-not-allowed]="!isIdle()"
          [class.pointer-events-none]="!isIdle()"
          (click)="onNewChat()">
          <sidebar-menu-button [tooltip]="isCollapsed() ? newChat : ''" tooltip-position="right" class="text-lg">
            <new-chat-icon />
            <span class="text-sm">{{ newChat }}</span>
          </sidebar-menu-button>
        </sidebar-menu-item>

        @let searchChats = 'searchChats' | transloco;
        <sidebar-menu-item [attr.aria-label]="searchChats" class="group-data-[collapsible=icon]:items-center">
          <sidebar-menu-button [tooltip]="isCollapsed() ? searchChats : ''" tooltip-position="right" class="text-lg" (click)="savedChatsDialog.open()">
            <magnifying-glass-icon />
            <span class="text-sm">{{ searchChats }}</span>
          </sidebar-menu-button>
        </sidebar-menu-item>
      }
    </sidebar-menu>

    <!-- "Search chats" opens the library dialog. Selecting a chat only closes it for now; loading the
         picked chat needs @sinequa/agent to expose a chatSelected output (pending lib change, ES-32885). -->
    <SavedChatsDialog #savedChatsDialog [instanceId]="instanceId" />
  }
  `,
  imports: [
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarMenuButtonComponent,
    TooltipDirective,
    RouterLink,
    RouterLinkActive,
    TranslocoPipe,
    RobotIcon,
    NewChatIcon,
    MagnifyingGlassIcon,
    SavedChatsDialogComponent
  ],
  host: {
    class: "contents"
  }
})
export class SidebarGroupAgentComponent {
  private readonly appStore = inject(AppStore);
  private readonly agentsStore = inject(AgentsStore);
  private readonly router = inject(Router);
  protected readonly instanceId = inject(AGENT_INSTANCE_ID);

  private readonly currentUrl = injectCurrentUrl();
  private readonly sidebar = useSidebar();
  protected readonly isCollapsed = computed(() => this.sidebar.state() === "collapsed");

  protected readonly allowAgent = computed(() => !!this.appStore.isAgentAllowed(this.instanceId));

  /** True while on the agent feature (route prefix `/chat`) — gates the sub-entries. */
  readonly isAgentRoute = computed(() => this.currentUrl()?.startsWith("/chat") ?? false);

  /** True only when the machine is Idle — used to avoid interrupting an active generation. */
  protected readonly isIdle = computed(() => this.agentsStore.agents()[this.instanceId]?.machine.state === "Connected.Operational.Idle");

  /**
   * Starts a new chat. Single-trigger strategy depending on the current route:
   * - Already on `/chat/new`: the router won't re-emit for the same URL, so dispatch the
   *   {@link createAgentNewChatEvent} DOM event directly (the agent resets in-place).
   * - On another route: navigate to `/chat/new`; the route change flips `<AgentInjector>`'s
   *   chatId to `undefined` and the agent resets. Dispatching here too would double-reset.
   */
  protected onNewChat(): void {
    const path = this.router.url.split(/[?;#]/, 1)[0];
    if (path === "/chat/new") {
      document.dispatchEvent(createAgentNewChatEvent(this.instanceId));
    } else {
      this.router.navigate(["/chat/new"]).catch(err => error("navigation to chat/new failed!", err));
    }
  }
}

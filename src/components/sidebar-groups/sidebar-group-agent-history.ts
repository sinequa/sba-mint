import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AGENT_INSTANCE_ID, AgentsStore, checkUUID, type SavedChat, SavedChatComponent } from "@sinequa/agent";
import { error } from "@sinequa/atomic";
import { SidebarGroupComponent } from "@sinequa/ui";
import { injectCurrentUrl } from "../../utils/routing";

/**
 * Saved-chats history rendered directly under `<sidebar-content>` (a sibling of the navigation
 * group), so it gets its own bounded, independently-scrolling region while the nav above stays
 * fixed — mirroring the agent demo's sidebar. Kept separate from `<app-sidebar-group-agent>`
 * (which holds the Agent entry + sub-entries inside the navigation menu) precisely so this scroll
 * region can be a `flex-1` child of the sidebar content.
 */
@Component({
  selector: "app-sidebar-group-agent-history",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAgentRoute() && showSavedChats()) {
      <sidebar-group class="min-h-0 flex-1 overflow-y-auto px-3 pb-3 group-data-[collapsible=icon]:hidden">
        <SavedChat
          class="empty:hidden shrink-0"
          [instanceId]="instanceId"
          [activeChatId]="activeChatId()"
          (chatSelected)="onChatSelected($event)" />
      </sidebar-group>
    }
  `,
  imports: [SidebarGroupComponent, SavedChatComponent],
  host: {
    class: "contents"
  },
  // Thin scrollbar matching the agent demo. Mint's global scrollbar styles the thumb/track but
  // never sets a width, so the history list would otherwise show the browser's default (chunky)
  // scrollbar. Scoped to this component's scroll container so the rest of Mint is untouched.
  styles: [
    `
      sidebar-group {
        scrollbar-width: thin;
        scrollbar-color: var(--color-gray-200) transparent;
      }
      sidebar-group::-webkit-scrollbar {
        width: 4px;
      }
      sidebar-group::-webkit-scrollbar-track {
        background: transparent;
      }
      sidebar-group::-webkit-scrollbar-thumb {
        border: none;
        border-radius: 9999px;
        background-color: var(--color-gray-200);
      }
      sidebar-group:hover::-webkit-scrollbar-thumb {
        background-color: var(--color-gray-300);
      }
    `
  ]
})
export class SidebarGroupAgentHistoryComponent {
  private readonly agentsStore = inject(AgentsStore);
  private readonly router = inject(Router);
  protected readonly instanceId = inject(AGENT_INSTANCE_ID);

  private readonly currentUrl = injectCurrentUrl();

  /** True while on the agent feature (route prefix `/chat`). */
  protected readonly isAgentRoute = computed(() => this.currentUrl()?.startsWith("/chat") ?? false);

  /** Per-instance UI visibility flag for the saved-chats history (backend-driven), as in the demo. */
  protected readonly showSavedChats = computed(() => this.agentsStore.isSavedChatsVisible(this.instanceId));

  /** True only when the machine is Idle — used to avoid interrupting an active generation. */
  private readonly isIdle = computed(() => this.agentsStore.agents()[this.instanceId]?.machine.state === "Connected.Operational.Idle");

  /** Derives the active chat id from the URL (`/chat/:uuid`) to highlight it in the history list. */
  protected readonly activeChatId = computed(() => {
    const path = (this.currentUrl() ?? "").split(/[?;#]/, 1)[0];
    const segments = path.split("/").filter(Boolean);
    return segments[0] === "chat" && segments[1] && checkUUID(segments[1]) ? segments[1] : undefined;
  });

  /** Navigates to the selected saved chat (chatId flows back in via the route). Ignored while busy. */
  protected onChatSelected(chat: SavedChat): void {
    if (!this.isIdle()) return;
    this.router.navigate(["/chat", chat.id]).catch(err => error("navigation to saved chat failed!", err));
  }
}

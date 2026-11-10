import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, viewChild } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { AGENT_INSTANCE_ID, AgentsStore, createAgentNewChatEvent, type SavedChat, SavedChatsDialogComponent } from "@sinequa/agent";
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

/** Host tag names (as reported by `tagName`) of the @sinequa/agent Rename/Delete saved-chat prompts. */
const SAVED_CHAT_PROMPT_TAGS = new Set(["DELETEPROMPT", "RENAMEPROMPT"]);
/** A prompt is hidden through a `hidden` host class toggled by the library. */
const SAVED_CHAT_PROMPT_VISIBLE_SELECTOR = "deleteprompt:not(.hidden), renameprompt:not(.hidden)";

@Component({
  selector: "app-sidebar-group-agent",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  @if (allowAgent()) {
    <sidebar-menu>
      @let agent = 'agent' | transloco;
      <!-- Agent parent entry (mirrors the Search parent entry). -->
      <sidebar-menu-item aria-label="agent" class="group-data-[collapsible=icon]:items-center">
        <sidebar-menu-button aria-hidden [tooltip]="isCollapsed() ? agent : ''" tooltip-position="right" class="text-lg" routerLink="/chat/new" routerLinkActive="active" #rla2="routerLinkActive" [attr.data-active]="rla2.isActive || null">
          <robot-icon />
          <span class="text-sm">{{ agent }}</span>
        </sidebar-menu-button>
        <a class="sr-only" [attr.aria-label]="agent" routerLink="/chat/new" routerLinkActive="active" #rla2="routerLinkActive" [attr.data-active]="rla2.isActive || null">{{ agent }}</a>
      </sidebar-menu-item>

      <!-- Sub-entries, only while on the agent route (mirrors the Search widgets pattern).
           The saved-chats history is rendered separately by <app-sidebar-group-agent-history>
           so it gets its own scroll region (like the demo). -->
      @if (isAgentRoute()) {
        @let newChat = 'newChat' | transloco;
        <sidebar-menu-item
          class="group-data-[collapsible=icon]:items-center"
          [attr.aria-label]="newChat"
          [class.cursor-pointer]="canNavigate()"
          [class.cursor-not-allowed]="!canNavigate()"
          [class.pointer-events-none]="!canNavigate()"
          (click)="onNewChat()">
          <sidebar-menu-button aria-hidden [tooltip]="isCollapsed() ? newChat : ''" tooltip-position="right" class="text-lg">
            <new-chat-icon />
            <span class="text-sm">{{ newChat }}</span>
          </sidebar-menu-button>
          <a class="sr-only" [attr.aria-label]="newChat">{{ newChat }}</a>
        </sidebar-menu-item>

        @let searchChats = 'searchChats' | transloco;
        <sidebar-menu-item [attr.aria-label]="searchChats" class="group-data-[collapsible=icon]:items-center">
          <sidebar-menu-button aria-hidden [tooltip]="isCollapsed() ? searchChats : ''" tooltip-position="right" class="text-lg" (click)="openSavedChats(savedChatsDialog)">
            <magnifying-glass-icon />
            <span class="text-sm">{{ searchChats }}</span>
          </sidebar-menu-button>
         <a class="sr-only" [attr.aria-label]="searchChats" (click)="openSavedChats(savedChatsDialog)">{{ searchChats }}</a>
        </sidebar-menu-item>
      }
    </sidebar-menu>

    <!-- "Search chats" opens the library dialog; binding (chatSelected) loads the picked chat and the
         dialog closes itself — same wiring as the agent demo's app-sidebar. -->
    <SavedChatsDialog #savedChatsDialog [instanceId]="instanceId" (chatSelected)="onChatSelected($event)" (closed)="stopAdoptingPrompts()" />
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

  /** True when loading/starting another chat is safe — `AgentsStore.canLoadChat` is the library's
   * single source of truth (allows Idle/WaitingForApproval/Editing…, blocks while busy), as in the demo. */
  protected readonly canNavigate = computed(() => this.agentsStore.canLoadChat(this.instanceId));

  /**
   * Starts a new chat. Single-trigger strategy depending on the current route:
   * - Already on `/chat/new`: the router won't re-emit for the same URL, so dispatch the
   *   {@link createAgentNewChatEvent} DOM event directly (the agent resets in-place).
   * - On another route: navigate to `/chat/new`; the route change flips `<AgentInjector>`'s
   *   chatId to `undefined` and the agent resets. Dispatching here too would double-reset.
   */
  protected onNewChat(): void {
    // Defense in depth behind the pointer-events gating: keyboard activation bypasses it, and a
    // reset fired while loading is unsafe would cancel the in-flight turn (mirrors the demo).
    if (!this.canNavigate()) return;
    const path = this.router.url.split(/[?;#]/, 1)[0];
    if (path === "/chat/new") {
      document.dispatchEvent(createAgentNewChatEvent(this.instanceId));
    } else {
      this.router.navigate(["/chat/new"]).catch(err => error("navigation to chat/new failed!", err));
    }
  }

  private readonly savedChatsDialogHost = viewChild("savedChatsDialog", { read: ElementRef<HTMLElement> });
  private promptObserver?: MutationObserver;
  private dialogCancelListener?: { dialog: HTMLDialogElement; listener: (e: Event) => void };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopAdoptingPrompts());
  }

  /**
   * Opens the "Search chats" dialog and works around an @sinequa/agent stacking bug: the dialog is
   * opened with `showModal()` (top layer + `body.inert`), while the Rename/Delete prompts of its inner
   * saved-chat list teleport themselves to `document.body` and rely on `z-index`. Nothing outside the
   * top layer can stack above a modal dialog, so the prompts opened hidden behind it (and inert) and
   * only showed up once the dialog went away (e.g. on resize). While the dialog is open, any prompt
   * appended to `<body>` is moved into the open `<dialog>`, so it shares its top layer and stays
   * interactive. Prompts remove themselves on destroy, so nothing needs moving back.
   * TODO: drop once @sinequa/agent renders those prompts in the top layer itself.
   */
  protected openSavedChats(dialog: SavedChatsDialogComponent): void {
    dialog.open();

    const dialogEl = this.savedChatsDialogHost()?.nativeElement.querySelector("dialog");
    if (!dialogEl) return;

    this.stopAdoptingPrompts();
    this.promptObserver = new MutationObserver(mutations => {
      for (const { addedNodes } of mutations) {
        addedNodes.forEach(node => {
          if (node instanceof HTMLElement && SAVED_CHAT_PROMPT_TAGS.has(node.tagName)) {
            dialogEl.appendChild(node);
          }
        });
      }
    });
    // The inner list (and its prompts) mounts right after open(), so observing now catches them.
    this.promptObserver.observe(document.body, { childList: true });

    // Escape would otherwise close the whole dialog (destroying the prompt mid-way): while a
    // prompt is shown, keep the dialog open.
    const listener = (e: Event) => {
      if (dialogEl.querySelector(SAVED_CHAT_PROMPT_VISIBLE_SELECTOR)) e.preventDefault();
    };
    dialogEl.addEventListener("cancel", listener);
    this.dialogCancelListener = { dialog: dialogEl, listener };
  }

  protected stopAdoptingPrompts(): void {
    this.promptObserver?.disconnect();
    this.promptObserver = undefined;
    if (this.dialogCancelListener) {
      this.dialogCancelListener.dialog.removeEventListener("cancel", this.dialogCancelListener.listener);
      this.dialogCancelListener = undefined;
    }
  }

  /** Loads the chat picked in the search dialog (chatId flows back in via the route). Ignored while busy. */
  protected onChatSelected(chat: SavedChat): void {
    if (!this.canNavigate()) return;
    this.router.navigate(["/chat", chat.id]).catch(err => error("navigation to saved chat failed!", err));
  }
}

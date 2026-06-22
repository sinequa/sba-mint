import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, Type, untracked, viewChild } from "@angular/core";
import { Router } from "@angular/router";
import { getState } from "@ngrx/signals";
import {
  AdminDirective,
  AGENT_INSTANCE_ID,
  AgentGenerationDirective,
  AgentInjector,
  type AgentInjectorProvidersHook,
  type AgentSavedChatEvent,
  AgentsStore,
  type AgentToolbarAction,
  CopyToClipboardDirective,
  createAgentNewChatEvent,
  ErrorDirective,
  FeedbackDirective,
  type SavedChat,
  SavedChatComponent
} from "@sinequa/agent";
import { error } from "@sinequa/atomic";
import { debouncedSignal, SelectionStore } from "@sinequa/atomic-angular";
import {
  ButtonComponent,
  HistoryIcon,
  IconButtonComponent,
  NewChatIcon,
  ResizableHandleComponent,
  ResizablePanelComponent,
  ResizablePanelGroupComponent,
  XMarkIcon
} from "@sinequa/ui";
import { AgentPreview } from "../../../components/preview/agent/agent-preview";
import { SearchInputComponent } from "../../../components/search-input";
import { AgentDebugDirective } from "./directives/debug.directive";
import { AgentSavedChatDirective } from "./directives/saved-chat.directive";

type Panel = "chat" | "preview";

@Component({
  selector: "app-agent-page-layout",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AgentInjector,
    ResizablePanelGroupComponent,
    ResizablePanelComponent,
    ResizableHandleComponent,
    AgentPreview,
    NewChatIcon,
    HistoryIcon,
    SavedChatComponent,
    XMarkIcon,
    ButtonComponent,
    IconButtonComponent,
    SearchInputComponent
  ],
  template: `
    <main class="relative flex flex-1">
      <!-- for mobile -> action buttons fixed to top-right -->
      <div class="fixed top-0 right-0 z-20 flex h-14 items-center gap-1 px-2 md:hidden">
        <button variant="none" icon-button (click)="toggleHistory()" title="History">
          <history-icon />
        </button>
        <button variant="none" icon-button (click)="startNewChat()" title="New Chat">
          <new-chat-icon />
        </button>
      </div>

      <!-- saved-chats — floating slide-in panel (non-modal: the chat stays interactive behind it).
           Auto-closes as soon as the pointer leaves it; stays open while hovered. -->
      <aside
        class="absolute left-0 top-0 z-30 h-full w-[20rem] p-3 pt-16 transition-transform duration-300 ease-out max-md:w-full md:pt-3"
        [class.-translate-x-full]="historyCollapsed()"
        [inert]="historyCollapsed()"
        (mouseleave)="closeHistory()">
        <div class="flex h-full w-full flex-col gap-2 rounded-3xl border border-menu-border bg-background px-4 py-3 shadow-lg">
          <!-- header -->
          <div class="flex items-center justify-between">
            <span class="font-semibold">History</span>
            <button variant="none" icon-button (click)="toggleHistory()" aria-label="Close history">
              <xmark-icon />
            </button>
          </div>
          <!-- content -->
          <div class="scrollbar-thin flex-1 flex flex-col gap-2 overflow-y-auto">
            <search-input [(value)]="searchText" />
            <SavedChat
              class="gap-3 empty:hidden"
              [instanceId]="instanceId"
              [searchText]="debouncedSearchText()"
              [activeChatId]="chatId()"
              (chatSelected)="onChatSelected($event)" />
          </div>
        </div>
      </aside>

      <ResizablePanelGroup>
        <ResizablePanel [defaultSize]="100" [minSize]="25" [class.max-md:hidden]="activeMobilePanel() !== 'chat'">
          <div class="flex h-full flex-col">
            <!-- buttons -->
            <div class="hidden shrink-0 items-center gap-2 bg-background px-2 pt-6 pb-2 md:flex">
              <button variant="none" icon-button (click)="toggleHistory()">
                <history-icon />
              </button>
              <button variant="none" icon-button (click)="startNewChat()">
                <new-chat-icon />
              </button>
            </div>

            <!-- agent -->
            <div class="agent-scroll-area h-[calc(100dvh-3rem)] overflow-y-auto" [style.scrollbar-width]="'none'">
              <AgentInjector [chatId]="chatId()" [instanceId]="instanceId" [welcomeComponent]="welcomeComponent()"
                  [emptyComponent]="emptyComponent()"
                  [errorComponent]="errorComponent()"
                  [agentToolbarActions]="agentToolbarActions()"
                  [userToolbarActions]="userToolbarActions()"
                  [providersHook]="providersHook()" />
            </div>
          </div>
        </ResizablePanel>

        <!-- preview -->
        <ResizableHandle [withHandle]="true" [class.hidden]="previewCollapsed()" />
        <ResizablePanel [defaultSize]="0" [minSize]="25" [class.max-md:hidden]="activeMobilePanel() !== 'preview'">
          <div class="sticky top-14 h-full me-8">
            <div class="relative h-full">
              <agent-preview class="absolute inset-4 w-full h-[calc(100%-2rem)] bg-tool-card-widget border-tool-card-border flex flex-col gap-2 rounded-2xl border" (onClose)="closePreview()" />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  `,
  hostDirectives: [
    AgentGenerationDirective,
    CopyToClipboardDirective,
    FeedbackDirective,
    AdminDirective,
    ErrorDirective,
    AgentSavedChatDirective,
    AgentDebugDirective
  ],
  host: {
    class: "flex h-screen text-foreground bg-background",
    "(agent-saved-chat)": "onSavedChatEvent($event)"
  },
  // Mint-only tweak (we don't patch @sinequa/agent): collapse the agent-header (name) button
  // rendered by the lib to its robot icon, and reveal the full label + chevron on hover.
  // Scoped to this page and targeted at the trigger button that contains a <robot-icon>.
  styles: [
    `
      :host ::ng-deep button:has(> robot-icon) {
        gap: 0;
      }
      :host ::ng-deep button:has(> robot-icon) > span,
      :host ::ng-deep button:has(> robot-icon) > chevron-down-icon {
        display: inline-block;
        max-width: 0;
        margin-left: 0;
        overflow: hidden;
        white-space: nowrap;
        vertical-align: middle;
        opacity: 0;
        transition:
          max-width 200ms ease,
          margin-left 200ms ease,
          opacity 200ms ease;
      }
      :host ::ng-deep button:has(> robot-icon):hover > span {
        max-width: 12rem;
        margin-left: 0.5rem;
        opacity: 1;
      }
      :host ::ng-deep button:has(> robot-icon):hover > chevron-down-icon {
        max-width: 1rem;
        margin-left: 0.25rem;
        opacity: 1;
      }

      /* Hide the agent's vertical scrollbar (and the lib's inner scroll container) for a
         cleaner look — scrolling still works. Scoped to the agent area so the history
         panel's own scrollbar is unaffected. */
      :host ::ng-deep .agent-scroll-area,
      :host ::ng-deep .agent-scroll-area .overflow-y-auto {
        scrollbar-width: none; /* Firefox */
      }
      :host ::ng-deep .agent-scroll-area::-webkit-scrollbar,
      :host ::ng-deep .agent-scroll-area .overflow-y-auto::-webkit-scrollbar {
        display: none; /* WebKit */
      }

      /* ============================================================================
         TEMPORARY client-side workarounds for styling issues in @sinequa/agent's
         rendered output. These patch the library's DOM from the host app because we
         don't fork the lib. REMOVE each rule once the corresponding fix ships in a
         consumed @sinequa/agent version.
         ============================================================================ */

      /* Reset the bullet list rendered inside the lib's inline-reference components.
         !important is required to beat the list styling the lib/markdown renderer applies. */
      :host ::ng-deep inline-reference ul {
        list-style: none !important;
        padding: 0 !important;
      }

      /* Truncate the span segments inside the lib's inline-document-card aside
         (the last path segment isn't truncated upstream). */
      :host ::ng-deep inlinedocumentcard aside span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `
  ]
})
export class AgentPageLayoutComponent {
  readonly instanceId = inject(AGENT_INSTANCE_ID);
  readonly chatId = input<string | undefined>();

  /**
   * Per-instance customization pass-through inputs. Each maps 1:1 to the matching
   * `<AgentInjector>` typed input and is forwarded verbatim. Pages can pick any subset
   * to override per-route; unbound inputs let the global provider scope (agent.providers.ts) apply.
   */
  readonly welcomeComponent = input<Type<unknown> | null>();
  readonly emptyComponent = input<Type<unknown> | null>();
  readonly errorComponent = input<Type<unknown> | null>();
  readonly agentToolbarActions = input<AgentToolbarAction[]>();
  readonly userToolbarActions = input<AgentToolbarAction[]>();
  readonly providersHook = input<AgentInjectorProvidersHook>();

  private readonly router = inject(Router);
  private readonly selectionStore = inject(SelectionStore);
  private readonly agentsStore = inject(AgentsStore);
  private readonly panelGroup = viewChild(ResizablePanelGroupComponent);

  /** True only when the machine is in the Idle operational sub-state — used to avoid interrupting an active generation. */
  protected readonly isIdle = computed(() => this.agentsStore.agents()[this.instanceId]?.machine.state === "Connected.Operational.Idle");

  readonly previewCollapsed = signal(true);
  readonly historyCollapsed = signal(true);
  readonly searchText = signal("");
  protected readonly debouncedSearchText = debouncedSignal(this.searchText, 300);

  // On mobile, only one panel is visible at a time.
  protected readonly activeMobilePanel = computed<Panel>(() => (this.previewCollapsed() ? "chat" : "preview"));

  constructor() {
    // Open the preview panel when a document is selected (mirrors the agent demo).
    effect(() => {
      const { id } = getState(this.selectionStore);
      untracked(() => {
        if (!id || !this.previewCollapsed()) return;
        this.previewCollapsed.set(false);
        queueMicrotask(() => {
          this.panelGroup()?.setLayout([60, 40]);
        });
      });
    });

    // Reset selection and preview when navigating between chats (mirrors the agent demo).
    effect(() => {
      this.chatId(); // track route navigation
      this.selectionStore.clear();
      untracked(() => {
        this.previewCollapsed.set(true);
        this.panelGroup()?.setLayout([100, 0]);
      });
    });
  }

  closePreview(): void {
    this.previewCollapsed.set(true);
    this.panelGroup()?.setLayout([100, 0]);
    // Clear selection so the effect can re-trigger if the user clicks
    // the same reference again after dismissing the panel.
    this.selectionStore.clear();
  }

  toggleHistory(): void {
    this.historyCollapsed.set(!this.historyCollapsed());
  }

  /** Auto-close the floating history panel when the pointer leaves it (better desktop UX). */
  protected closeHistory(): void {
    this.historyCollapsed.set(true);
  }

  /**
   * Navigates to the selected saved chat so the agent loads it (chatId flows back in via the
   * route param). Silently ignored when the machine is not idle so an active generation is
   * never interrupted.
   */
  protected onChatSelected(chat: SavedChat): void {
    if (!this.isIdle()) return;
    this.router.navigate(["/chat", chat.id]).catch(err => error("navigation to saved chat failed!", err));
  }

  /**
   * When the currently-open saved chat is deleted from the history list, switch the agent to a
   * fresh chat so the deleted id no longer lingers in the URL. Deleting any other chat is ignored.
   */
  protected onSavedChatEvent(event: Event): void {
    const detail = (event as CustomEvent<AgentSavedChatEvent>).detail;
    if (detail?.id === "SAVED_CHAT_DELETED" && detail.chatId && detail.chatId === this.chatId()) {
      this.startNewChat();
    }
  }

  startNewChat() {
    const event = createAgentNewChatEvent(this.instanceId);
    document.dispatchEvent(event);
    this.router.navigate(["/chat/new"]).catch(err => error("navigation to chat/new failed!", err));
  }
}

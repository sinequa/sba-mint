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
  type InputFilterEntry
} from "@sinequa/agent";
import { error } from "@sinequa/atomic";
import { PrincipalStore, SelectionStore } from "@sinequa/atomic-angular";
import { ResizableHandleComponent, ResizablePanelComponent, ResizablePanelGroupComponent } from "@sinequa/ui";
import { AgentPreview } from "../../../components/preview/agent/agent-preview";
import { AgentDebugDirective } from "./directives/debug.directive";
import { AgentSavedChatDirective } from "./directives/saved-chat.directive";

type Panel = "chat" | "preview";

@Component({
  selector: "app-agent-page-layout",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgentInjector, ResizablePanelGroupComponent, ResizablePanelComponent, ResizableHandleComponent, AgentPreview],
  template: `
    <main class="relative flex flex-1">
      <ResizablePanelGroup>
        <ResizablePanel [defaultSize]="100" [minSize]="25" [class.max-md:hidden]="activeMobilePanel() !== 'chat'">
          <div class="flex h-full flex-col">
            <!-- agent -->
            <div class="h-[calc(100dvh-3rem)] overflow-y-auto" [style.scrollbar-width]="'none'">
              <AgentInjector [chatId]="chatId()" [instanceId]="instanceId" [welcomeComponent]="welcomeComponent()"
                  [emptyComponent]="emptyComponent()"
                  [errorComponent]="errorComponent()"
                  [agentToolbarActions]="agentToolbarActions()"
                  [userToolbarActions]="userToolbarActions()"
                  [providersHook]="providersHook()"
                  [inputFilters]="inputFilters()" />
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
  }
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
  readonly inputFilters = input<InputFilterEntry[]>();

  private readonly router = inject(Router);
  private readonly selectionStore = inject(SelectionStore);
  private readonly principalStore = inject(PrincipalStore);
  private readonly agentsStore = inject(AgentsStore);
  private readonly panelGroup = viewChild(ResizablePanelGroupComponent);

  /** True when loading/starting another chat is safe — `AgentsStore.canLoadChat` is the library's
   * source of truth (allows Idle/WaitingForApproval/Editing…, blocks while busy), as in the demo. */
  private readonly canNavigate = computed(() => this.agentsStore.canLoadChat(this.instanceId));

  readonly previewCollapsed = signal(true);

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

    // Start a fresh conversation whenever the effective user identity changes — i.e. an admin
    // overrides a user, switches to a different one, or reverts the override. The override dialog
    // only re-initializes the stores (re-fetching the principal), so without this the old chat id
    // lingers in the URL. startNewChat() both resets the agent and routes to /chat/new. The first
    // load is skipped so a deep-linked /chat/:id is preserved on refresh.
    let previousUserId: string | undefined;
    effect(() => {
      const userId = this.principalStore.userId();
      if (this.principalStore.state() !== "loaded" || !userId) return;
      untracked(() => {
        const isInitialLoad = previousUserId === undefined;
        const identityChanged = !isInitialLoad && userId !== previousUserId;
        previousUserId = userId;
        if (identityChanged) this.startNewChat();
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

  /**
   * When the currently-open saved chat is deleted from the history list, realign the route to a
   * fresh chat so the deleted id no longer lingers in the URL. The library already resets the
   * machine on deletion (guarded), so we only navigate — no createAgentNewChatEvent dispatch, which
   * would risk cancelling an in-flight turn in the delete-after-new-turn race. Mirrors the demo.
   * Ignored for other chats/instances, or when loading isn't safe.
   */
  protected onSavedChatEvent(event: Event): void {
    const detail = (event as CustomEvent<AgentSavedChatEvent>).detail;
    if (detail?.id !== "SAVED_CHAT_DELETED" || detail.instanceId !== this.instanceId || detail.chatId !== this.chatId()) return;
    if (!this.canNavigate()) return;
    this.router.navigate(["/chat/new"]).catch(err => error("navigation to chat/new failed!", err));
  }

  startNewChat() {
    const event = createAgentNewChatEvent(this.instanceId);
    document.dispatchEvent(event);
    this.router.navigate(["/chat/new"]).catch(err => error("navigation to chat/new failed!", err));
  }
}

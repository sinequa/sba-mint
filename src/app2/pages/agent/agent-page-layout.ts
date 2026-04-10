import { Component, computed, effect, inject, input, signal, untracked, viewChild } from "@angular/core";
import { Router } from "@angular/router";
import { HistoryIcon } from "@components/icons/history.icon";
import { NewChatIcon } from "@components/icons/new-chat.icon";
import {
  AdminDirective,
  AgentGenerationDirective,
  AgentInjector,
  CopyToClipboardDirective,
  createAgentNewChatEvent,
  ErrorDirective,
  ExpandedSearchResultsComponent,
  FeedbackDirective,
  SavedChatComponent,
  SearchExpansionService
} from "@sinequa/agent";
import { error } from "@sinequa/atomic";
import { SelectionStore } from "@sinequa/atomic-angular";
import {
  BreakpointObserverService,
  ButtonComponent,
  ResizableHandleComponent,
  ResizablePanelComponent,
  ResizablePanelGroupComponent,
  XMarkICon
} from "@sinequa/ui";
import { AgentPreview } from "../../../components/preview/agent/agent-preview";

type Panel = "chat" | "search" | "preview";

@Component({
  selector: "app-agent-page-layout",
  imports: [
    AgentInjector,
    ExpandedSearchResultsComponent,
    ResizablePanelGroupComponent,
    ResizablePanelComponent,
    ResizableHandleComponent,
    AgentPreview,
    NewChatIcon,
    HistoryIcon,
    SavedChatComponent,
    XMarkICon,
    ButtonComponent
  ],
  template: `
    <main class="flex flex-1">
      <!-- for mobile -> action buttons fixed to top-right -->
      <div class="fixed top-0 right-0 z-20 flex h-14 items-center gap-1 px-2 md:hidden">
        <button variant="ghost" size="icon" (click)="toggleHistory()" title="History">
          <history-icon />
        </button>
        <button variant="ghost" size="icon" (click)="startNewChat()" title="New Chat">
          <new-chat-icon />
        </button>
      </div>

      <ResizablePanelGroup>
        <!-- saved-chats -->
        <ResizablePanel
          [defaultSize]="0"
          [minSize]="breakpointService.isMobile() ? 0 : 15"
          [maxSize]="breakpointService.isMobile() ? 100 : 25"
          [class]="!historyCollapsed() ? '' : 'max-md:hidden'">
          <div class="flex h-full flex-1 p-3 pt-16 md:pt-3">
            <div class="flex h-full w-full flex-col gap-2 rounded-3xl border border-menu-border px-4 py-3 shadow-lg">
              <!-- header -->
              <div class="flex items-center justify-between">
                <span class="font-semibold">History</span>
                <button variant="ghost" size="icon" (click)="toggleHistory()" aria-label="Close history">
                  <xmark-icon />
                </button>
              </div>
              <!-- content -->
              <div class="scrollbar-thin flex-1 overflow-y-auto">
                <SavedChat class="gap-3 empty:hidden" />
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle [withHandle]="true" [class]="historyCollapsed() ? 'hidden' : 'max-md:hidden'" />

        <ResizablePanel [defaultSize]="100" [minSize]="0">
          <div class="flex h-full flex-col">
            <!-- buttons -->
            <div class="hidden shrink-0 items-center gap-2 bg-background px-2 pt-6 pb-2 md:flex">
              <button variant="ghost" size="icon" (click)="toggleHistory()">
                <history-icon />
              </button>
              <button variant="ghost" size="icon" (click)="startNewChat()">
                <new-chat-icon />
              </button>
            </div>

            <!-- agent -->
            <div class="h-[calc(100dvh-3rem)] overflow-y-auto" [style.scrollbar-width]="'none'">
              <AgentInjector [chatId]="chatId()" [instanceId]="instanceId" />
            </div>
          </div>
        </ResizablePanel>

        <!-- expanded search results -->
        <ResizableHandle [withHandle]="true" [class.hidden]="!searchExpansion.isExpanded()" />
        <ResizablePanel [defaultSize]="0" [minSize]="20" class="relative" [class.max-md:hidden]="activeMobilePanel() !== 'search'">
          <div class="absolute inset-0 overflow-auto p-3 pt-14 md:p-5">
            <ExpandedSearchResults class="h-full w-full" (close)="closeSearch()" />
          </div>
        </ResizablePanel>


        <!-- preview -->
        <ResizableHandle [withHandle]="true" [class]="previewCollapsed() ? 'hidden' : ''" />
        <ResizablePanel [defaultSize]="0" [minSize]="25">
          <div class="sticky top-14 h-full mx-4">
            <div class="relative h-full mx-4">
              <agent-preview class="absolute inset-4 w-full h-[calc(100%-2rem)] bg-tool-card-widget border-tool-card-border flex flex-col gap-2 rounded-2xl border" (onClose)="closePreview()" />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  `,
  hostDirectives: [AgentGenerationDirective, CopyToClipboardDirective, FeedbackDirective, AdminDirective, ErrorDirective],
  host: {
    class: "flex h-screen text-foreground bg-background"
  }
})
export class AgentPageLayoutComponent {
  readonly instanceId = "chatSearchInstance";
  readonly chatId = input<string | undefined>();

  private readonly router = inject(Router);
  readonly breakpointService = inject(BreakpointObserverService);
  private readonly selectionStore = inject(SelectionStore);
  protected readonly searchExpansion = inject(SearchExpansionService);
  private readonly panelGroup = viewChild(ResizablePanelGroupComponent);

  readonly previewCollapsed = signal(true);
  readonly historyCollapsed = signal(true);

  // On mobile, only one panel is visible at a time.
  // Preview takes priority (clicking a doc from search → show preview).
  protected readonly activeMobilePanel = computed<Panel>(() => {
    if (!this.previewCollapsed()) return "preview";
    else if (this.searchExpansion.isExpanded()) return "search";
    else return "chat";
  });

  constructor() {
    effect(() => {
      this.historyCollapsed();
      queueMicrotask(() => {
        this.previewCollapsed.set(true);
        this.selectionStore.clear();
        this.panelGroup()?.setLayout(this.computeLayout());
      });
    });

    effect(() => {
      const id = this.selectionStore.id?.();
      if (id && untracked(() => this.previewCollapsed())) {
        this.previewCollapsed.set(false);
        queueMicrotask(() => {
          this.panelGroup()?.setLayout(this.computeLayout());
        });
      }
    });

    // Resize panels when search expands
    effect(() => {
      const isExpanded = this.searchExpansion.isExpanded();
      if (isExpanded) {
        queueMicrotask(() => {
          this.panelGroup()?.setLayout(this.computeLayout());
        });
      }
    });
  }

  /**
   * Computes panel sizes [history, chat, search, preview] based on current state.
   *
   * Layout matrix (approximate percentages):
   *
   * | History        | Search | Preview | Layout               |
   * |----------------|--------|---------|----------------------|
   * | closed         | closed | closed  | [0,  100, 0,  0 ]    |
   * | closed         | open   | closed  | [0,  55,  45, 0 ]    |
   * | closed         | closed | open    | [0,  60,  0,  40]    |
   * | closed         | open   | open    | [0,  40,  30, 30]    |
   * | open (desktop) | closed | closed  | [25, 75,  0,  0 ]    |
   * | open (desktop) | open   | closed  | [25, 41,  34, 0 ]    |
   * | open (desktop) | closed | open    | [25, 45,  0,  30]    |
   * | open (desktop) | open   | open    | [25, 30,  23, 22]    |
   * | open (mobile)  | closed | —       | [100, 0,  0,  0 ]    |
   * | open (mobile)  | open   | —       | [90,  0,  10, 0 ]    |
   */
  private computeLayout(): number[] {
    const historyOpen = !this.historyCollapsed();
    const searchOpen = this.searchExpansion.isExpanded();
    const previewOpen = !this.previewCollapsed();
    const mobile = this.breakpointService.isMobile();

    // On mobile, history takes over the full screen
    if (mobile && historyOpen) {
      return searchOpen ? [90, 0, 10, 0] : [100, 0, 0, 0];
    }

    const h = historyOpen ? 25 : 0;
    const rem = 100 - h;

    if (!searchOpen && !previewOpen) {
      return [h, rem, 0, 0];
    }
    if (searchOpen && !previewOpen) {
      const chat = Math.round(rem * 0.55);
      return [h, chat, rem - chat, 0];
    }
    if (!searchOpen && previewOpen) {
      const chat = Math.round(rem * 0.6);
      return [h, chat, 0, rem - chat];
    }
    // search + preview
    const chat = Math.round(rem * 0.4);
    const search = Math.round(rem * 0.3);
    return [h, chat, search, rem - chat - search];
  }

  protected closeSearch(): void {
    this.searchExpansion.collapse();
    queueMicrotask(() => {
      this.panelGroup()?.setLayout(this.computeLayout());
    });
  }

  closePreview(): void {
    this.previewCollapsed.set(true);
    this.panelGroup()?.setLayout(this.computeLayout());
    // Clear selection so the effect can re-trigger if the user clicks
    // the same reference again after dismissing the panel.
    this.selectionStore.clear();
  }

  toggleHistory(): void {
    if (this.historyCollapsed() && !this.previewCollapsed()) {
      this.closePreview();
    }
    this.historyCollapsed.set(!this.historyCollapsed());
  }

  startNewChat() {
    const event = createAgentNewChatEvent(this.instanceId);
    document.dispatchEvent(event);
    this.router.navigate(["/chat/new"]).catch(err => error("navigation to chat/new failed!", err));
  }
}


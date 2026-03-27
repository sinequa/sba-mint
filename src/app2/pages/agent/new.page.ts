import { Component, effect, inject, signal, untracked, viewChild } from "@angular/core";
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
  FeedbackDirective,
  SavedChatComponent
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

@Component({
  selector: "app-chat-new",
  imports: [
    AgentInjector,
    ResizablePanelGroupComponent,
    ResizablePanelComponent,
    ResizableHandleComponent,
    AgentPreview,
    XMarkICon,
    SavedChatComponent,
    ButtonComponent,
    HistoryIcon,
    NewChatIcon
  ],
  template: `
    <main class="flex flex-1">
      <!-- for mobile -> action buttons fixed to top-right -->
      <div class="fixed top-0 right-0 z-20 flex h-14 items-center gap-1 px-2 md:hidden">
        <button [variant]="'ghost'" [size]="'icon'" (click)="toggleHistory()" title="History">
          <history-icon />
        </button>
        <button [variant]="'ghost'" [size]="'icon'" (click)="startNewChat()" title="New Chat">
          <new-chat-icon />
        </button>
      </div>

      <ResizablePanelGroup>
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
                <button [variant]="'ghost'" [size]="'icon'" class="text-gray-800" (click)="toggleHistory()" aria-label="Close history">
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
              <button class="text-gray-800" [variant]="'ghost'" [size]="'icon'" (click)="toggleHistory()">
                <history-icon />
              </button>
              <button class="text-gray-800" [variant]="'ghost'" [size]="'icon'" (click)="startNewChat()">
                <new-chat-icon />
              </button>
            </div>

            <!-- agent -->
            <div class="h-[calc(100dvh-3rem)] overflow-y-auto" [style.scrollbar-width]="'none'">
              <AgentInjector [instanceId]="instanceId" />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle [withHandle]="true" [class]="previewCollapsed() ? 'hidden' : ''" />

        <!-- preview -->
        <ResizablePanel [defaultSize]="0" [minSize]="40">
          <div class="sticky top-14 h-full overflow-auto">
            <div class="relative h-full">
              <agent-preview class="absolute inset-0 size-full" (onClose)="closePreview()" />
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
export class ChatNewPage {
  readonly instanceId = "chatSearchInstance";

  private readonly router = inject(Router);
  private readonly selectionStore = inject(SelectionStore);
  readonly breakpointService = inject(BreakpointObserverService);

  private readonly panelGroup = viewChild(ResizablePanelGroupComponent);

  readonly previewCollapsed = signal(true);
  readonly historyCollapsed = signal(true);

  constructor() {
    effect(() => {
      const collapsed = this.historyCollapsed();
      queueMicrotask(() => {
        if (collapsed) {
          this.panelGroup()?.setLayout([0, 100, 0]);
        } else if (this.breakpointService.isMobile()) {
          this.panelGroup()?.setLayout([100, 0, 0]);
        } else {
          this.panelGroup()?.setLayout([25, 75, 0]);
        }
      });
    });

    effect(() => {
      const id = this.selectionStore.id?.();
      if (id && untracked(() => this.previewCollapsed())) {
        this.previewCollapsed.set(false);
        queueMicrotask(() => this.panelGroup()?.setLayout([0, 60, 40]));
      }
    });
  }

  closePreview(): void {
    this.previewCollapsed.set(true);
    this.panelGroup()?.setLayout([0, 100, 0]);
    // Clear selection so the effect can re-trigger if the user clicks
    // the same reference again after dismissing the panel.
    this.selectionStore.clear();
  }

  toggleHistory(): void {
    this.historyCollapsed.set(!this.historyCollapsed());
  }

  startNewChat() {
    const event = createAgentNewChatEvent(this.instanceId);
    document.dispatchEvent(event);
    this.router.navigate(["/chat/new"]).catch(err => error("navigation to chat/new failed!", err));
  }
}


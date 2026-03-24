import { Component, DestroyRef, effect, inject, signal, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { SheetPreviewerComponent } from "@components/preview/sheet-previewer";
import { HubConnectionState } from "@microsoft/signalr";
import {
  AGENT_INSTANCE_ID,
  AgentInjector,
  AgentsStore,
  LoggerService,
  NotificationsService,
  provideSavedChatsService,
  SavedChatComponent,
  SavedChatsService,
  SignalRWebService
} from "@sinequa/agent";
import { notify } from "@sinequa/atomic";
import { BreakpointObserverService, ButtonComponent, ResizableHandleComponent, ResizablePanelComponent, ResizablePanelGroupComponent,
  XMarkICon
} from "@sinequa/ui";
import { HistoryIcon } from "@components/icons/history.icon";
import { NewChatIcon } from "@components/icons/new-chat.icon";

@Component({
  selector: "app-agent-layout",
  imports: [
    AgentInjector,
    SheetPreviewerComponent,
    ResizablePanelGroupComponent,
    ResizablePanelComponent,
    ResizableHandleComponent,
    SavedChatComponent,
    ButtonComponent,
    XMarkICon,
    HistoryIcon,
    NewChatIcon
  ],
  providers: [
    { provide: AGENT_INSTANCE_ID, useValue: "chatSearchInstance" },
    LoggerService,
    {
      provide: SavedChatsService,
      useFactory: (logger: LoggerService, store: InstanceType<typeof AgentsStore>) => provideSavedChatsService("chatSearchInstance", logger, store),
      deps: [LoggerService, AgentsStore]
    }
  ],
  host: {
    class: "block h-[calc(100dvh-1rem)]",
    "[style.--background]": "'transparent'"
  },
  template: `
    <!-- for mobile -> action buttons fixed to top-right -->
    <div class="fixed top-0 right-0 z-20 flex h-14 items-center gap-1 px-2 md:hidden">
      <button [variant]="'ghost'" [size]="'icon'" (click)="navigateNewChat()" title="New Chat">
        <history-icon />
      </button>
      <button [variant]="'ghost'" [size]="'icon'" (click)="toggleHistory()" title="History">
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
                <xmark-icon></xmark-icon>
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

      <ResizablePanel [defaultSize]="100" [minSize]="0" [class]="historyCollapsed() ? '' : 'max-md:hidden'">
        <div class="flex h-full flex-col">
          <div class="hidden shrink-0 items-center gap-2 bg-background px-2 pt-6 pb-2 md:flex">
            <button class="text-gray-800" [variant]="'ghost'" [size]="'icon'" (click)="toggleHistory()">
              <history-icon />
            </button>
            <button class="text-gray-800" [variant]="'ghost'" [size]="'icon'" (click)="navigateNewChat()">
              <new-chat-icon />
            </button>
          </div>
          <div class="scrollbar-none flex-1 overflow-y-auto">
            <AgentInjector instanceId="chatSearchInstance" />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>

    <sheet-previewer />
  `
})
export class AgentLayoutComponent {
  destroyRef = inject(DestroyRef);
  agentsStore = inject(AgentsStore);
  signalRWebService = inject(SignalRWebService);
  notifications = inject(NotificationsService);
  retryDelays = [0, 2000, 5000, 10000, 30000];

  private readonly router = inject(Router);
  readonly breakpointService = inject(BreakpointObserverService);
  private readonly panelGroup = viewChild(ResizablePanelGroupComponent);

  readonly historyCollapsed = signal(true);

  constructor() {
    effect(() => {
      // wait for saved chat to be ready before setting the whole agent feature as ready
      if (this.agentsStore.savedChatReady()) this.agentsStore.setReady(true);
    });

    effect(() => {
      const collapsed = this.historyCollapsed();
      queueMicrotask(() => {
        if (collapsed) {
          this.panelGroup()?.setLayout([0, 100]);
        } else if (this.breakpointService.isMobile()) {
          this.panelGroup()?.setLayout([100, 0]);
        } else {
          this.panelGroup()?.setLayout([20, 80]);
        }
      });
    });

    this.signalRWebService.signalREvents$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      switch (event.state) {
        case HubConnectionState.Reconnecting:
          notify.error(`Connection lost. Attempt (${event.retryCount}/${this.retryDelays.length})`, {
            duration: event.retryDelay
          });
          break;
        case HubConnectionState.Connected:
          notify.success("Connected!", { duration: 2500 });
          break;
        case HubConnectionState.Disconnected:
          notify.error("Could not connect to server. Please refresh the page to try again.", {
            action: { label: "Refresh", onClick: () => window.location.reload() },
            duration: Infinity,
            closeButton: true
          });
          break;
      }
    });

    this.notifications.notifications.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(notification => {
      switch (notification.type) {
        case "success":
          notify.success(notification.title);
          break;
        case "error":
          notify.error(notification.title);
          break;
        case "info":
          notify.info(notification.title);
          break;
        case "warning":
          notify.warning(notification.title);
          break;
      }
    });
  }

  navigateNewChat(): void {
    this.router.navigate(["/chat/new"]);
  }

  toggleHistory(): void {
    this.historyCollapsed.set(!this.historyCollapsed());
  }
}

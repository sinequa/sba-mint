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
    XMarkICon
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
  styles: `
    @media (max-width: 767px) {
      :host ::ng-deep resizable-panel-group,
      :host ::ng-deep resizablepanelgroup {
        position: relative;
      }
      :host ::ng-deep resizable-panel,
      :host ::ng-deep resizablepanel {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      :host ::ng-deep resizable-handle,
      :host ::ng-deep resizablehandle {
        display: none !important;
      }
    }
  `,
  host: {
    class: "block h-[calc(100dvh-1rem)]",
    "[style.--background]": "'transparent'"
  },
  template: `
    <!-- for mobile -> action buttons fixed to top-right -->
    <div class="fixed top-0 right-0 z-20 flex h-14 items-center gap-1 px-2 md:hidden">
      <button [variant]="'ghost'" [size]="'icon'" (click)="navigateNewChat()" title="New Chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10.0387 21.6338L13.4849 19.2H17.9999C19.9874 19.2 21.5999 17.5875 21.5999 15.6V7.20001C21.5999 5.21251 19.9874 3.60001 17.9999 3.60001H5.9999C4.0124 3.60001 2.3999 5.21251 2.3999 7.20001V15.6C2.3999 17.5875 4.0124 19.2 5.9999 19.2H7.1999V21.9C7.1999 22.2375 7.3874 22.545 7.6874 22.6988C7.9874 22.8525 8.3474 22.83 8.62115 22.635L10.0387 21.6338ZM13.4849 17.4C13.1137 17.4 12.7499 17.5163 12.4462 17.73C11.3737 18.4875 10.2224 19.2975 8.9999 20.1638V18.3C8.9999 18.195 8.98115 18.09 8.9474 17.9963C8.82365 17.6475 8.4899 17.4 8.0999 17.4H5.9999C5.00615 17.4 4.1999 16.5938 4.1999 15.6V7.20001C4.1999 6.20626 5.00615 5.40001 5.9999 5.40001H17.9999C18.9937 5.40001 19.7999 6.20626 19.7999 7.20001V15.6C19.7999 16.5938 18.9937 17.4 17.9999 17.4H13.4849ZM11.9999 7.80001C11.5012 7.80001 11.0999 8.20126 11.0999 8.70001V10.5H9.2999C8.80115 10.5 8.3999 10.9013 8.3999 11.4C8.3999 11.8988 8.80115 12.3 9.2999 12.3H11.0999V14.1C11.0999 14.5988 11.5012 15 11.9999 15C12.4987 15 12.8999 14.5988 12.8999 14.1V12.3H14.6999C15.1987 12.3 15.5999 11.8988 15.5999 11.4C15.5999 10.9013 15.1987 10.5 14.6999 10.5H12.8999V8.70001C12.8999 8.20126 12.4987 7.80001 11.9999 7.80001Z"
            fill="currentColor" />
        </svg>
      </button>
      <button [variant]="'ghost'" [size]="'icon'" (click)="toggleHistory()" title="History">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M4.1999 6.40124V4.49999C4.1999 4.00124 3.79865 3.59999 3.2999 3.59999C2.80115 3.59999 2.3999 4.00124 2.3999 4.49999V8.69999C2.3999 9.19874 2.80115 9.59999 3.2999 9.59999H7.4999C7.99865 9.59999 8.3999 9.19874 8.3999 8.69999C8.3999 8.20124 7.99865 7.79999 7.4999 7.79999H5.42615C6.81365 5.63249 9.2399 4.19999 11.9999 4.19999C16.3087 4.19999 19.7999 7.69124 19.7999 12C19.7999 16.3087 16.3087 19.8 11.9999 19.8C10.4062 19.8 8.92865 19.3237 7.69865 18.5062C7.28615 18.2325 6.7274 18.345 6.4499 18.7575C6.1724 19.17 6.28865 19.7287 6.70115 20.0062C8.2199 21.0112 10.0424 21.6 11.9999 21.6C17.3024 21.6 21.5999 17.3025 21.5999 12C21.5999 6.69749 17.3024 2.39999 11.9999 2.39999C8.78615 2.39999 5.9399 3.97874 4.1999 6.40124ZM11.9999 7.19999C11.5012 7.19999 11.0999 7.60124 11.0999 8.09999V12C11.0999 12.24 11.1937 12.4687 11.3624 12.6375L14.0624 15.3375C14.4149 15.69 14.9849 15.69 15.3337 15.3375C15.6824 14.985 15.6862 14.415 15.3337 14.0662L12.8962 11.6287V8.09999C12.8962 7.60124 12.4949 7.19999 11.9962 7.19999H11.9999Z"
            fill="currentColor" />
        </svg>
      </button>
    </div>

    <ResizablePanelGroup>
      <ResizablePanel [defaultSize]="0" [minSize]="15" [maxSize]="25" [class]="!historyCollapsed() ? '' : 'max-md:hidden'">
        <div class="flex p-3 pt-16 md:pt-3 h-full flex-1">
          <div class="flex h-full w-full flex-col border border-menu-border rounded-3xl py-3 px-4 gap-2 shadow-lg">
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
        <div class="flex flex-col h-full">
          <div class="hidden md:flex items-center gap-2 px-2 pt-6 pb-2 bg-background shrink-0">
            <button class="text-gray-800" [variant]="'ghost'" [size]="'icon'" (click)="toggleHistory()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4.1999 6.40124V4.49999C4.1999 4.00124 3.79865 3.59999 3.2999 3.59999C2.80115 3.59999 2.3999 4.00124 2.3999 4.49999V8.69999C2.3999 9.19874 2.80115 9.59999 3.2999 9.59999H7.4999C7.99865 9.59999 8.3999 9.19874 8.3999 8.69999C8.3999 8.20124 7.99865 7.79999 7.4999 7.79999H5.42615C6.81365 5.63249 9.2399 4.19999 11.9999 4.19999C16.3087 4.19999 19.7999 7.69124 19.7999 12C19.7999 16.3087 16.3087 19.8 11.9999 19.8C10.4062 19.8 8.92865 19.3237 7.69865 18.5062C7.28615 18.2325 6.7274 18.345 6.4499 18.7575C6.1724 19.17 6.28865 19.7287 6.70115 20.0062C8.2199 21.0112 10.0424 21.6 11.9999 21.6C17.3024 21.6 21.5999 17.3025 21.5999 12C21.5999 6.69749 17.3024 2.39999 11.9999 2.39999C8.78615 2.39999 5.9399 3.97874 4.1999 6.40124ZM11.9999 7.19999C11.5012 7.19999 11.0999 7.60124 11.0999 8.09999V12C11.0999 12.24 11.1937 12.4687 11.3624 12.6375L14.0624 15.3375C14.4149 15.69 14.9849 15.69 15.3337 15.3375C15.6824 14.985 15.6862 14.415 15.3337 14.0662L12.8962 11.6287V8.09999C12.8962 7.60124 12.4949 7.19999 11.9962 7.19999H11.9999Z"
                  fill="currentColor" />
              </svg>
            </button>
            <button class="text-gray-800" [variant]="'ghost'" [size]="'icon'" (click)="navigateNewChat()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M10.0387 21.6338L13.4849 19.2H17.9999C19.9874 19.2 21.5999 17.5875 21.5999 15.6V7.20001C21.5999 5.21251 19.9874 3.60001 17.9999 3.60001H5.9999C4.0124 3.60001 2.3999 5.21251 2.3999 7.20001V15.6C2.3999 17.5875 4.0124 19.2 5.9999 19.2H7.1999V21.9C7.1999 22.2375 7.3874 22.545 7.6874 22.6988C7.9874 22.8525 8.3474 22.83 8.62115 22.635L10.0387 21.6338ZM13.4849 17.4C13.1137 17.4 12.7499 17.5163 12.4462 17.73C11.3737 18.4875 10.2224 19.2975 8.9999 20.1638V18.3C8.9999 18.195 8.98115 18.09 8.9474 17.9963C8.82365 17.6475 8.4899 17.4 8.0999 17.4H5.9999C5.00615 17.4 4.1999 16.5938 4.1999 15.6V7.20001C4.1999 6.20626 5.00615 5.40001 5.9999 5.40001H17.9999C18.9937 5.40001 19.7999 6.20626 19.7999 7.20001V15.6C19.7999 16.5938 18.9937 17.4 17.9999 17.4H13.4849ZM11.9999 7.80001C11.5012 7.80001 11.0999 8.20126 11.0999 8.70001V10.5H9.2999C8.80115 10.5 8.3999 10.9013 8.3999 11.4C8.3999 11.8988 8.80115 12.3 9.2999 12.3H11.0999V14.1C11.0999 14.5988 11.5012 15 11.9999 15C12.4987 15 12.8999 14.5988 12.8999 14.1V12.3H14.6999C15.1987 12.3 15.5999 11.8988 15.5999 11.4C15.5999 10.9013 15.1987 10.5 14.6999 10.5H12.8999V8.70001C12.8999 8.20126 12.4987 7.80001 11.9999 7.80001Z"
                  fill="currentColor" />
              </svg>
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
  private readonly breakpointService = inject(BreakpointObserverService);
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
    this.router.navigate(["/agent/new"]);
  }

  toggleHistory(): void {
    this.historyCollapsed.set(!this.historyCollapsed());
  }
}

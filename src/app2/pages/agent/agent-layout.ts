import { Component, DestroyRef, effect, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SheetPreviewerComponent } from "@components/preview/sheet-previewer";
import { SidebarMainComponent } from "@components/sidebar/sidebar";
import { HubConnectionState } from "@microsoft/signalr";
import { AgentInjector, AgentsStore, NotificationsService, SignalRWebService } from "@sinequa/agent";
import { notify } from "@sinequa/atomic";
import { SidebarProviderComponent, SidebarTriggerComponent } from "@sinequa/ui";

@Component({
  selector: "app-agent-layout",
  imports: [AgentInjector, SidebarProviderComponent, SidebarMainComponent, SidebarTriggerComponent, SheetPreviewerComponent],
  template: `
    <sidebar-provider>
      <main-sidebar triggerName="sidebar-agent">
        <header>
          <nav class="mt-4 ml-4 flex items-center justify-between">
            <sidebar-trigger />
          </nav>
        </header>
        <div>
          <AgentInjector instanceId="chatSearchInstance" />
        </div>
      </main-sidebar>
    </sidebar-provider>

    <sheet-previewer />
  `
})
export class AgentLayoutComponent {
  destroyRef = inject(DestroyRef);
  agentsStore = inject(AgentsStore);
  signalRWebService = inject(SignalRWebService);
  notifications = inject(NotificationsService);
  retryDelays = [0, 2000, 5000, 10000, 30000];

  constructor() {
    effect(() => {
      // wait for saved chat to be ready before setting the whole agent feature as ready
      if (this.agentsStore.savedChatReady()) this.agentsStore.setReady(true);
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
}

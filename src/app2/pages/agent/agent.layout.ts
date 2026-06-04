import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterModule } from "@angular/router";
import { AgentReconnectingDetail, NotificationsService } from "@sinequa/agent";
import { notify } from "@sinequa/atomic";

@Component({
  selector: "app-agent-layout",
  imports: [RouterModule],
  template: `
    <div class="relative grid">
      <div class="h-full scrollbar-none overflow-y-auto">
        <router-outlet />
      </div>
    </div>
  `
})
export class AgentLayoutComponent {
  destroyRef = inject(DestroyRef);
  notifications = inject(NotificationsService);
  retryDelays = [0, 2000, 5000, 10000, 30000];

  constructor() {
    // Connection lifecycle events bubbled from the Agent component — wire up toast notifications.
    const controller = new AbortController();

    document.addEventListener(
      "agent-reconnecting",
      (e: Event) => {
        const { retryCount, retryDelay } = (e as CustomEvent<AgentReconnectingDetail>).detail;
        notify.error(`Connection lost. Attempt (${retryCount}/${this.retryDelays.length})`, { duration: retryDelay });
      },
      { signal: controller.signal }
    );

    document.addEventListener("agent-reconnected", () => notify.success("Connected!", { duration: 2500 }), {
      signal: controller.signal
    });

    // Alternative: soft reconnect — re-establishes only the SignalR connection without a page reload.
    // The XState machine, conversation history, chatId, and all application state are fully preserved.
    //
    //   document.addEventListener('agent-connection-lost', (e: Event) => {
    //     const { instanceId } = (e as CustomEvent<AgentConnectionLostDetail>).detail;
    //     document.dispatchEvent(createAgentRetryConnectionEvent(instanceId));
    //   }, { signal: controller.signal });
    document.addEventListener(
      "agent-connection-lost",
      () => {
        notify.error("Could not connect to server. Please refresh the page to try again.", {
          action: { label: "Refresh", onClick: () => window.location.reload() },
          duration: Infinity,
          closeButton: true
        });
      },
      { signal: controller.signal }
    );

    this.destroyRef.onDestroy(() => controller.abort());

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

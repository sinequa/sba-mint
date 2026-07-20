import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { RouterModule } from "@angular/router";
import { TranslocoService } from "@jsverse/transloco";
import { AgentReconnectingDetail, NotificationsService, SIGNALR_RETRY_DELAYS, SIGNALR_RETRY_DELAYS_DEFAULT } from "@sinequa/agent";
import { notify } from "@sinequa/atomic";
import { ApplicationService } from "@sinequa/atomic-angular";

@Component({
  selector: "app-agent-layout",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  retryDelays = inject(SIGNALR_RETRY_DELAYS, { optional: true }) ?? SIGNALR_RETRY_DELAYS_DEFAULT;
  private readonly applicationService = inject(ApplicationService);
  private readonly transloco = inject(TranslocoService);
  // Emits the translated title once the (async) translation file is loaded, and again on each
  // language change. Using selectTranslate (not translate) avoids showing the raw key on first load.
  private readonly pageTitle = toSignal(this.transloco.selectTranslate("pageTitle.agent"));

  constructor() {
    effect(() => {
      const title = this.pageTitle();
      if (title) {
        this.applicationService.setTitle(title);
      }
    });

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
          closeButton: true,
          // `important` is forwarded as-is to ngx-sonner by the app-root notification listener,
          // but @sinequa/atomic@1.1.1's NotificationsEventOptions type does not declare it yet.
          // TODO: drop this cast once atomic (with `important` in NotificationsEventOptions) is bumped.
          important: true
        } as Parameters<typeof notify.error>[1] & { important: boolean });
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

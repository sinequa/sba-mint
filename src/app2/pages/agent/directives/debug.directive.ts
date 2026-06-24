import { Directive, ElementRef, inject } from "@angular/core";
import { provideTranslocoScope, TranslocoService } from "@jsverse/transloco";
import { AGENT_DEBUG_EVENT_NAME, type AgentDebugEvent } from "@sinequa/agent";
import { notify } from "@sinequa/atomic";

/**
 * Mint's host reaction to the `agent-debug` DOM event dispatched by the active debug presentation
 * strategy.
 *
 * Mirrors the library's `DebugDirective` defaults but surfaces feedback through Mint's `notify`
 * helper. Copy comes from the shared `agt-directives` transloco scope.
 *
 * - `DEBUG_POPUP_BLOCKED`: error notification using the event's `errorMessage`, falling back to a
 *   translated generic message.
 * - `DEBUG_PANEL_OPENED` / `DEBUG_PANEL_CLOSED`: silent lifecycle pings.
 *
 * Attached via `hostDirectives` on the agent page layout.
 */
@Directive({
  selector: "[appAgentDebug]",
  providers: [provideTranslocoScope("agt-directives")]
})
export class AgentDebugDirective {
  private readonly el = inject(ElementRef);
  private readonly transloco = inject(TranslocoService);

  constructor() {
    this.el.nativeElement.addEventListener(AGENT_DEBUG_EVENT_NAME, (event: CustomEvent<AgentDebugEvent>) => {
      if (event.detail.id === "DEBUG_POPUP_BLOCKED") {
        notify.error(event.detail.errorMessage ?? this.transloco.translate("agtDirectives.debug.popupBlocked"));
      }
    });
  }
}

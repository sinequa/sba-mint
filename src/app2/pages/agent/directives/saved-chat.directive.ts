import { Directive, ElementRef, inject } from "@angular/core";
import { provideTranslocoScope, TranslocoService } from "@jsverse/transloco";
import { AGENT_SAVED_CHAT_EVENT_NAME, type AgentSavedChatEvent } from "@sinequa/agent";
import { notify } from "@sinequa/atomic";

/**
 * Mint's host reaction to the `agent-saved-chat` DOM event.
 *
 * Mirrors the library's `SavedChatDirective` defaults but surfaces feedback through Mint's
 * `notify` helper (instead of the library's direct `ngx-sonner` call) so saved-chat toasts go
 * through the same notification path as the rest of the agent page. Copy comes from the shared
 * `agt-directives` transloco scope, which Mint already bundles.
 *
 * - `SAVED_CHAT_RENAMED` / `SAVED_CHAT_DELETED`: success notification (explicit user actions).
 * - All `*_FAILED` ids: error notification using the event's `errorMessage`, falling back to a
 *   translated generic message.
 * - `SAVED_CHAT_LOADED` / `SAVED_CHAT_SAVED`: silent — these run continuously in the background.
 *
 * Attached via `hostDirectives` on the agent page layout.
 */
@Directive({
  selector: "[appAgentSavedChat]",
  providers: [provideTranslocoScope("agt-directives")]
})
export class AgentSavedChatDirective {
  private readonly el = inject(ElementRef);
  private readonly transloco = inject(TranslocoService);

  constructor() {
    this.el.nativeElement.addEventListener(AGENT_SAVED_CHAT_EVENT_NAME, (event: CustomEvent<AgentSavedChatEvent>) => {
      const { id, errorMessage } = event.detail;
      switch (id) {
        case "SAVED_CHAT_RENAMED":
          notify.success(this.transloco.translate("agtDirectives.savedChat.renamed"));
          break;
        case "SAVED_CHAT_DELETED":
          notify.success(this.transloco.translate("agtDirectives.savedChat.deleted"));
          break;
        case "SAVED_CHAT_LOAD_FAILED":
          notify.error(errorMessage ?? this.transloco.translate("agtDirectives.savedChat.loadFailed"));
          break;
        case "SAVED_CHAT_SAVE_FAILED":
          notify.error(errorMessage ?? this.transloco.translate("agtDirectives.savedChat.saveFailed"));
          break;
        case "SAVED_CHAT_RENAME_FAILED":
          notify.error(errorMessage ?? this.transloco.translate("agtDirectives.savedChat.renameFailed"));
          break;
        case "SAVED_CHAT_DELETE_FAILED":
          notify.error(errorMessage ?? this.transloco.translate("agtDirectives.savedChat.deleteFailed"));
          break;
      }
    });
  }
}

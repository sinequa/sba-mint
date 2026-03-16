import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";

import {
  AdminDirective,
  AgentGenerationDirective,
  AgentInjector,
  CopyToClipboardDirective,
  checkUUID,
  ErrorDirective,
  FeedbackDirective
} from "@sinequa/agent";
import { SidebarTriggerComponent } from "@sinequa/ui";

@Component({
  selector: "app-chat-id",
  imports: [AgentInjector, SidebarTriggerComponent],
  providers: [],
  template: `
    <header class="flex h-14 shrink-0 items-center gap-2 px-4 md:hidden">
      <sidebar-trigger />
    </header>
    <main class="flex flex-1">
      <AgentInjector class="grow" [chatId]="chatId()" instanceId="chatSearchInstance" />
    </main>
  `,
  hostDirectives: [AgentGenerationDirective, CopyToClipboardDirective, FeedbackDirective, AdminDirective, ErrorDirective],
  host: {
    class: "flex h-screen text-foreground bg-background"
  }
})
export class ChatIdPage {
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap);

  readonly chatId = computed(() => {
    const id = this.paramMap()?.get("id");
    return id && checkUUID(id) ? id : undefined;
  });
}

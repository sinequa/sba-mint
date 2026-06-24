import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { checkUUID } from "@sinequa/agent";
import { AgentPageLayoutComponent } from "./agent-page-layout";

@Component({
  selector: "app-chat-id",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgentPageLayoutComponent],
  template: `<app-agent-page-layout [chatId]="chatId()" />`,
  host: { class: "contents" }
})
export class ChatIdPage {
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap);

  readonly chatId = computed(() => {
    const id = this.paramMap()?.get("id");
    return id && checkUUID(id) ? id : undefined;
  });
}

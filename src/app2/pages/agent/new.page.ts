import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AgentPageLayoutComponent } from "./agent-page-layout";

@Component({
  selector: "app-chat-new",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgentPageLayoutComponent],
  template: `<app-agent-page-layout />`,
  host: { class: "contents" }
})
export class ChatNewPage {}

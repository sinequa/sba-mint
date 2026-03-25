import { Component, computed, effect, inject, signal, untracked, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import {
  AdminDirective,
  AgentGenerationDirective,
  AgentInjector,
  checkUUID,
  CopyToClipboardDirective,
  ErrorDirective,
  FeedbackDirective
} from "@sinequa/agent";
import { SelectionStore } from "@sinequa/atomic-angular";
import { ResizableHandleComponent, ResizablePanelComponent, ResizablePanelGroupComponent } from "@sinequa/ui";
import { AgentPreview } from "../../../components/preview/agent/agent-preview";

@Component({
  selector: "app-chat-id",
  imports: [AgentInjector, ResizablePanelGroupComponent, ResizablePanelComponent, ResizableHandleComponent, AgentPreview],
  providers: [],
  template: `
        <main class="flex flex-1">
          <ResizablePanelGroup>
            <ResizablePanel [defaultSize]="100" [minSize]="40">
              <div class="h-[calc(100vh-3rem)] overflow-y-auto" [style.scrollbar-width]="'none'">
                <AgentInjector [chatId]="chatId()" [instanceId]="instanceId" />
              </div>
            </ResizablePanel>
            <ResizableHandle [withHandle]="true" [class]="previewCollapsed() ? 'hidden' : ''" />
            <ResizablePanel [defaultSize]="0" [minSize]="40">
              <div class="sticky top-14 h-full overflow-auto">
                <div class="relative h-full">
                  <agent-preview class="absolute inset-0 size-full" (onClose)="closePreview()" />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
  `,
  hostDirectives: [AgentGenerationDirective, CopyToClipboardDirective, FeedbackDirective, AdminDirective, ErrorDirective],
  host: {
    class: "flex h-screen text-foreground bg-background"
  }
})
export class ChatIdPage {
  readonly instanceId = "chatSearchInstance";

  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap);

  readonly chatId = computed(() => {
    const id = this.paramMap()?.get("id");
    return id && checkUUID(id) ? id : undefined;
  });

  private readonly selectionStore = inject(SelectionStore);
  private readonly panelGroup = viewChild(ResizablePanelGroupComponent);
  readonly previewCollapsed = signal(true);

  constructor() {
    effect(() => {
      const id = this.selectionStore.id?.();
      if (id && untracked(() => this.previewCollapsed())) {
        this.previewCollapsed.set(false);
        queueMicrotask(() => this.panelGroup()?.setLayout([60, 40]));
      }
    });
  }

  closePreview(): void {
    this.previewCollapsed.set(true);
    this.panelGroup()?.setLayout([100, 0]);
    // Clear selection so the effect can re-trigger if the user clicks
    // the same reference again after dismissing the panel.
    this.selectionStore.clear();
  }
}

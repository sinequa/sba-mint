import { Component, effect, inject, signal, untracked, viewChild } from "@angular/core";
import { PreviewContentComponent } from "@components/preview/preview-content/preview-content";
import { getState } from "@ngrx/signals";
import { AdminDirective, AgentGenerationDirective, AgentInjector, CopyToClipboardDirective, ErrorDirective, FeedbackDirective } from "@sinequa/agent";
import { SelectionStore } from "@sinequa/atomic-angular";
import { ResizableHandleComponent, ResizablePanelComponent, ResizablePanelGroupComponent } from "@sinequa/ui";

@Component({
  selector: "app-chat-new",
  imports: [AgentInjector, ResizablePanelGroupComponent, ResizablePanelComponent, ResizableHandleComponent, PreviewContentComponent],
  template: `
        <main class="flex flex-1">
          <ResizablePanelGroup>
            <ResizablePanel [defaultSize]="100" [minSize]="40">
              <div class="h-[calc(100vh-3rem)] overflow-y-auto" [style.scrollbar-width]="'none'">
                <AgentInjector [instanceId]="instanceId" />
              </div>
            </ResizablePanel>
            <ResizableHandle [withHandle]="true" [class]="previewCollapsed() ? 'hidden' : ''" />
            <ResizablePanel [defaultSize]="0" [minSize]="40">
              <div class="sticky top-14 h-full overflow-auto">
                <preview-content />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>

  `,
  hostDirectives: [AgentGenerationDirective, CopyToClipboardDirective, FeedbackDirective, AdminDirective, ErrorDirective],
  host: {
    class: "flex h-screen text-foreground bg-background",
    "(preview-close)": "closePreview()"
  }
})
export class ChatNewPage {
  readonly instanceId = "chatSearchInstance";
  private readonly selectionStore = inject(SelectionStore);
  private readonly panelGroup = viewChild(ResizablePanelGroupComponent);

  readonly previewCollapsed = signal(true);

  constructor() {
    effect(() => {
      const { id } = getState(this.selectionStore);
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


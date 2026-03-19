import { Component, computed, effect, inject, signal, untracked, viewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { PreviewContentComponent } from "@components/preview/preview-content/preview-content";
import { getState } from "@ngrx/signals";
import {
  AdminDirective,
  AgentGenerationDirective,
  AgentInjector,
  CopyToClipboardDirective,
  checkUUID,
  ErrorDirective,
  FeedbackDirective
} from "@sinequa/agent";
import { SelectionStore } from "@sinequa/atomic-angular";
import { ButtonComponent, ResizableHandleComponent, ResizablePanelComponent, ResizablePanelGroupComponent, XMarkICon } from "@sinequa/ui";

@Component({
  selector: "app-chat-id",
  imports: [
    AgentInjector,
    ResizablePanelGroupComponent,
    ResizablePanelComponent,
    ResizableHandleComponent,
    PreviewContentComponent,
    ButtonComponent,
    XMarkICon
  ],
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
                  <button variant="ghost" size="icon" (click)="closePreview()" class="m-2" aria-label="Close preview">
                    <XMarkIcon class="size-4" />
                  </button>
                  <preview-content class="h-full" />
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

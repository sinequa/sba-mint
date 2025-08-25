import { Component, computed, DestroyRef, inject, input, model } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { PreviewService } from '@sinequa/atomic-angular';
import { TabComponent, TabsComponent } from '@sinequa/ui';

export type PreviewTab = 'summary' | 'preview' | 'discussion';

@Component({
  selector: 'preview-tabs, PreviewTabs, previewtabs',
  standalone: true,
  imports: [TranslocoPipe, TabsComponent, TabComponent],
  template: `
    @if (displaySummary() || displayChatWithDoc()) {
      <Tabs class="w-full px-6" variant="ghost">
        <Tab class="w-fit" shadow="none" value="previewTab-preview" [active]="activeTab() === 'preview'" (click)="activeTab.set('preview')">
          {{ 'preview.documentPreview' | transloco }}
        </Tab>

        @if (displaySummary()) {
          <Tab class="w-fit" variant="ai" shadow="none" value="previewTab-summary" [active]="activeTab() === 'summary'" (click)="setSummaryAssistant()">
            @if (isStreaming()) {
              <i class="fa-solid fa-spinner animate-spin"></i>
            } @else {
              <i class="fa-solid fa-sparkles"></i>
            }
            {{ 'preview.summarize' | transloco }}
          </Tab>
        }

        @if (displayChatWithDoc()) {
          <Tab
            class="w-fit"
            variant="ai"
            shadow="none"
            value="previewTab-discussion"
            [active]="activeTab() === 'discussion'"
            (click)="setChatWithDocAssistant()">
            <i class="fa-solid fa-comments"></i>
            {{ 'preview.discussion' | transloco }}
          </Tab>
        }
      </Tabs>
    }
    <!-- tabs content -->
    <div class="relative h-full flex-grow overflow-auto">
      <ng-content></ng-content>
    </div>
  `
})
export class PreviewTabsComponent {
  destroyRef = inject(DestroyRef);
  previewService = inject(PreviewService);

  activeTab = model<PreviewTab>('preview');
  showAssistants = model([
    { name: 'discussion', enabled: false, visible: false },
    { name: 'summary', enabled: false, visible: false }
  ]);

  isStreaming = input(false);
  displaySummary = computed(() => this.showAssistants().some(assistant => assistant.name === 'summary' && assistant.visible));
  displayChatWithDoc = computed(() => this.showAssistants().some(assistant => assistant.name === 'discussion' && assistant.visible));

  setSummaryAssistant() {
    const assistants = this.showAssistants().filter(assistant => assistant.name !== 'summary');
    this.showAssistants.set([...assistants, { name: 'summary', enabled: true, visible: true }]);
    this.activeTab.set('summary');
  }
  setChatWithDocAssistant() {
    const assistants = this.showAssistants().filter(assistant => assistant.name !== 'discussion');
    this.showAssistants.set([...assistants, { name: 'discussion', enabled: true, visible: true }]);
    this.activeTab.set('discussion');
  }
}

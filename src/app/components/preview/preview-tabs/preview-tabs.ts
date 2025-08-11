import { Component, computed, DestroyRef, inject, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { PreviewService } from '@sinequa/atomic-angular';
import { TabComponent, TabsComponent } from '@sinequa/ui';

export type PreviewTab = 'summary' | 'preview' | 'discussion';

@Component({
  selector: 'app-preview-tabs',
  standalone: true,
  imports: [TranslocoPipe, TabsComponent, TabComponent],
  templateUrl: './preview-tabs.html'
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

  constructor() {
    // if the scrollTo event is emitted, set the active tab to preview if the active tab is not already preview
    this.previewService.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event === 'scrollTo' && this.activeTab() !== 'preview') {
        this.activeTab.set('preview');
      }
    });
  }

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

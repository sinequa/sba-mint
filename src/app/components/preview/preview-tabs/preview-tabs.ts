import { Component, computed, input, model } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

export type PreviewTab = 'summary' | 'preview' | 'discussion';

@Component({
  selector: 'app-preview-tabs',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './preview-tabs.html'
})
export class PreviewTabsComponent {
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

import { NgClass } from '@angular/common';
import { Component, ViewChild, computed, inject } from '@angular/core';

import { AssistantComponent } from '@/app/components/assistant/assistant';
import { ApplicationStore } from '@/stores';

import { DrawerComponent } from '../../drawer.component';
import { DrawerService } from '../../drawer.service';

@Component({
  selector: 'app-drawer-assistant',
  standalone: true,
  imports: [NgClass, AssistantComponent],
  providers: [DrawerService],
  templateUrl: './assistant.component.html',
  styleUrls: ['../../drawer.component.scss', './assistant.component.scss']
})
export class DrawerAssistantComponent extends DrawerComponent {
  @ViewChild('assistant') assistant: AssistantComponent;

  protected isAssistantReady = computed(() => this.applicationStore.assistantReady());

  private applicationStore = inject(ApplicationStore);

  public newChat(): void {
    this.assistant?.newChat();
  }
}

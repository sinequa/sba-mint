import { NgClass } from '@angular/common';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { AssistantComponent } from '@/app/components/assistant/assistant';
import { ApplicationStore } from '@/stores';

import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { RawMessage } from '@sinequa/assistant/chat';
import { Query } from '@sinequa/atomic';
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
  protected assistantQuery = signal<Query | undefined>(undefined);

  private applicationStore = inject(ApplicationStore);

  // TODO: remove once assistant input focus issue is fixed
  // https://sinequa.atlassian.net/browse/ES-22815 
  private drawerStack = inject(DrawerStackService);
  protected isDrawerOpened = computed(() => this.drawerStack.isChatOpened());

  public askAI(text: string): void {
    const messages: RawMessage[] = [{ role: 'user', content: text, additionalProperties: { display: true } }];

    this.assistant?.askAI(messages);
  }

  public newChat(): void {
    this.assistant?.newChat();
  }
}

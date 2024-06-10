import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RawMessage } from '@sinequa/assistant/chat';
import { Query } from '@sinequa/atomic';

import { AssistantComponent } from '@/app/components/assistant/assistant';
import { ApplicationStore } from '@/stores';

import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
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
  @ViewChild('assistant') set assistant(assistant: AssistantComponent) {
    this.assistantComponent = assistant;

    // if there are pending messages, give them to the assistant
    if (this.pendingMessage) {
      this.assistantComponent.askAI(this.pendingMessage);
      this.pendingMessage = undefined;
    }
  }

  isStreaming = output<boolean>();

  protected assistantComponent: AssistantComponent | undefined = undefined;
  protected isAssistantReady = computed(() => this.applicationStore.assistantReady());
  protected assistantQuery = signal<Query | undefined>(undefined);

  private applicationStore = inject(ApplicationStore);
  private cdr = inject(ChangeDetectorRef);
  private pendingMessage: RawMessage[] | undefined = undefined;

  // TODO: remove once assistant input focus issue is fixed
  // https://sinequa.atlassian.net/browse/ES-22815 
  private drawerStack = inject(DrawerStackService);
  protected isDrawerOpened = toSignal(this.drawerStack.isChatOpened);

  public askAI(text: string): void {
    const messages: RawMessage[] = [{ role: 'user', content: text, additionalProperties: { display: true } }];

    // if assistant exist, give it the messages
    if (this.assistantComponent)
      this.assistantComponent.askAI(messages);
    // else, queue the messages
    else {
      this.pendingMessage = messages;
      this.cdr.detectChanges();
    }
  }

  public newChat(): void {
    this.assistantComponent?.newChat();
  }

  public onStreaming(event: boolean): void {
    console.log("isStreaming", event)
    this.isStreaming.emit(event);
  }
}

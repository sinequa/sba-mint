import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HubConnection } from '@microsoft/signalr';
import { getState } from '@ngrx/signals';
import { catchError, of } from 'rxjs';

import { Query as Q } from '@sinequa/core/app-utils';

import {
  ChatComponent,
  ChatConfig,
  ChatContextAttachment,
  ChatSettingsV3Component,
  InitChat,
  MessageHandler,
  RawMessage,
  SuggestedAction
} from '@sinequa/assistant/chat';

import { Article } from '@sinequa/atomic';
import { AppStore, DrawerStackService, PreviewHighlights, QueryParamsStore, SelectionStore, UserSettingsStore } from '@sinequa/atomic-angular';

type AssistantMode = 'prompt' | 'query';

@Component({
  selector: 'assistant, Assistant',
  imports: [ChatComponent, ChatSettingsV3Component],
  template: `
    @if (isChatInitialized() || showAssistant()) {
      <sq-chat-v3
        class="block h-full w-full"
        #sqChat
        [query]="query"
        [chat]="initChat"
        [instanceId]="instanceId()!"
        (openPreview)="handlePreview($event)"
        (openDocument)="handleRedirect($event)"
        (config)="getChatConfig($event)"
        (connection)="onConnection.emit($event)"
        [messageHandlers]="messageHandlers()" />
      <ng-template #sqChatSettings>
        <sq-chat-settings-v3
          [style.--ast-chat-settings-width]="'570px'"
          [instanceId]="instanceId()!"
          (update)="handleUpdate($event)"
          (cancel)="handleCancel($event)">
        </sq-chat-settings-v3>
      </ng-template>
    }
  `,
  styleUrl: './assistant.css',
  host: {
    class: 'block relative',
    '[attr.no-progress]': 'noProgress'
  },
  encapsulation: ViewEncapsulation.None
})
export class AssistantComponent {
  sqChat = viewChild(ChatComponent);

  // used to initialize the chat when the user clicks on the Ask AI button or when the component is created without "question"
  isChatInitialized = signal<boolean | undefined>(undefined);
  // Used to initialize the chat unconditionally
  showAssistant = input<boolean | undefined>(false);

  // Inject services
  userSettingsStore = inject(UserSettingsStore);
  appStore = inject(AppStore);
  selectionStore = inject(SelectionStore);

  // If we use the component without inputs, we need to initialize the default values using computed()
  // This is because the input() function is not called when the component is used without inputs
  _mode = input<AssistantMode>('prompt', { alias: 'mode' });
  instanceId = input<string>();

  isStreaming = output<boolean>();
  configOutput = output<ChatConfig | undefined>();
  onConnection = output<HubConnection>();
  onReady = output<boolean>();

  showProgress = input<boolean>(false);
  messageHandlers = input<Map<string, MessageHandler<any>>>(new Map());

  open = signal(false);

  noProgress = false;
  _progress = effect(() => (this.noProgress = !this.showProgress()));

  drawerStack = inject(DrawerStackService);
  initChat: InitChat | undefined = undefined;
  config = signal<ChatConfig | undefined>(undefined);

  // used to retrieve the query text entered by the user
  queryParamsStore = inject(QueryParamsStore);

  // used to cronstruct a valid query object used by the sqChat component
  defaultQueryName = computed(() => this.appStore.getDefaultQuery()?.name || '_query');
  query = new Q(this.defaultQueryName());

  // mandatory to refresh the sqChat component when the query changes manually
  cdr = inject(ChangeDetectorRef);

  getChatConfig(config: ChatConfig): void {
    this.config.set(config);
    this.configOutput.emit(config);
  }

  constructor(private destroyRef: DestroyRef) {
    effect(() => {
      // each time the query params store changes, we need to update the query object
      if (this.instanceId() === undefined) return;

      const q = this.queryParamsStore.getQuery();
      this.query = { ...this.query, ...q } as Q;
    });

    effect(() => {
      if (this.sqChat() === undefined) return;

      this.sqChat()
        ?.chatService?.streaming$.pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error('Unhandled error in streaming', error);
            return [];
          })
        )
        .subscribe({
          next: streaming => this.isStreaming.emit(streaming),
          error: error => console.error('Error in streaming', error)
        });

      this.sqChat()
        ?.chatService?.initProcess$.pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error('Unhandled error in init process', error);
            return of(false);
          })
        )
        .subscribe({
          next: value => this.onReady.emit(value)
        });
    });

    effect(() => {
      // each time the selection store changes, we need to update the attached IDs
      const { assistantIdsToAttach } = getState(this.selectionStore);
      this.attachToChat(assistantIdsToAttach);
    });

    afterNextRender(() => {
      // ATTENTION: takeUntilDestroyed works only in the context of a component
      // that's why we need to use a reference of the DestroyRef class here

      // once the component is created, we need to attach the assistantIdsToAttach to the chat if any
      const { assistantIdsToAttach } = getState(this.selectionStore);
      this.attachToChat(assistantIdsToAttach);
    });
  }

  handleCancel(event: ChatConfig) {
    console.log('Cancel event: ', event);
    this.open.set(false);
  }

  handleUpdate(event: ChatConfig) {
    const assistants = this.userSettingsStore.assistants();
    assistants[this.instanceId()!] = event;

    this.userSettingsStore.updateAssistantSettings(assistants);
    this.open.set(false);
  }

  handlePreview(event: ChatContextAttachment, withQueryText = true) {
    this.drawerStack.stack(event.record as Article, withQueryText);

    const previewHighlights: PreviewHighlights | undefined =
      event.parts && event.parts.length
        ? {
            highlights: [
              {
                category: 'snippet',
                highlights: event.parts
              }
            ],
            snippetId: event.$partId !== undefined ? event.$partId! - 1 : undefined
          }
        : undefined;

    this.selectionStore.update({ previewHighlights });
  }

  public newChat(): void {
    this.sqChat()?.newChat();
  }

  handleSuggestAction($event: SuggestedAction, argument: boolean) {
    const chat = this.sqChat();
    if (chat) {
      chat.question = $event.content;
      chat.submitQuestion();
    }
  }

  handleRedirect($event: any) {
    const url = $event.url1;

    if (url && typeof url === 'string' && url.trim() !== '') {
      window.open(url, '_blank');
    }
  }

  askAI(question?: string) {
    // if the user comes from the search page, we need to set the query text to the one entered by the user (using Ask AI button)
    // when the sqChat component is created, we need to set the query text to the one entered by the user (using Ask AI button)
    if (question) {
      const messages: RawMessage[] = [{ role: 'user', content: question || '', additionalProperties: { display: true, isUserInput: true } }];
      this.initChat = { messages } as InitChat;
    } else {
      this.initChat = undefined;
    }
    this.isChatInitialized.set(true);
  }

  attachToChat(ids: string[]): void {
    if (!ids || ids.length === 0) return;

    const sqChatInstance = this.sqChat();
    if (sqChatInstance) {
      sqChatInstance.attachToChat(ids);
    } else {
      console.error('sqChat instance is not defined');
    }
  }
}

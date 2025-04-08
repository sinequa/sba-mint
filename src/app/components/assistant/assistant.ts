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
import { catchError } from 'rxjs';

import { Query as Q } from '@sinequa/core/app-utils';
import { LoginService } from '@sinequa/core/login';

import {
  ChatComponent,
  ChatConfig,
  ChatContextAttachment,
  ChatSettingsV3Component,
  InitChat,
  InstanceManagerService,
  MessageHandler,
  RawMessage,
  SuggestedAction
} from '@sinequa/assistant/chat';

import { Article } from '@sinequa/atomic';
import {
  AppStore,
  DrawerStackService,
  NavigationService,
  PreviewHighlights,
  QueryParamsStore,
  SelectionStore,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import { getState } from '@ngrx/signals';

type AssistantMode = 'prompt' | 'query';

@Component({
  selector: 'assistant, Assistant',
  standalone: true,
  imports: [ChatComponent, ChatSettingsV3Component],
  template: `
    <sq-chat-v3
      class="block h-full w-full"
      #sqChat
      [query]="query"
      [chat]="initChat"
      [instanceId]="instanceId()!"
      (openPreview)="handlePreview($event)"
      (openDocument)="handleRedirect($event)"
      (config)="getChatConfig($event)"
      [messageHandlers]="messageHandlers()" />

    <ng-template #sqChatSettings>
      <sq-chat-settings-v3
        [style.--ast-chat-settings-width]="'570px'"
        [instanceId]="instanceId()!"
        (update)="handleUpdate($event)"
        (cancel)="handleCancel($event)">
      </sq-chat-settings-v3>
    </ng-template>
  `,
  styleUrl: './assistant.css',
  host: {
    '[attr.no-progress]': 'noProgress'
  },
  encapsulation: ViewEncapsulation.None
})
export class AssistantComponent {
  sqChat = viewChild(ChatComponent);

  // Inject services
  loginService = inject(LoginService);
  navigationService = inject(NavigationService);
  userSettingsStore = inject(UserSettingsStore);
  appStore = inject(AppStore);
  selectionStore = inject(SelectionStore);
  instanceManagerService = inject(InstanceManagerService);

  // If we use the component without inputs, we need to initialize the default values using computed()
  // This is because the input() function is not called when the component is used without inputs
  _mode = input<AssistantMode>('prompt', { alias: 'mode' });
  instanceId = input<string>();

  isStreaming = output<boolean>();
  configOutput = output<ChatConfig | undefined>();

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
      if (this.instanceId() === undefined) return;

      const q = this.queryParamsStore.getQuery();
      this.query = { ...this.query, ...q } as Q;
    });

    effect(() => {
      const { assistantIdsToAttach } = getState(this.selectionStore);
      this.attachToChat(assistantIdsToAttach);
    });

    afterNextRender(() => {
      // ATTENTION: takeUntilDestroyed works only in the context of a component
      // that's why we need to use a reference of the DestroyRef class here

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

  askAI(question: string) {
    // if the user comes from the search page, we need to set the query text to the one entered by the user (using Ask AI button)
    // when the sqChat component is created, we need to set the query text to the one entered by the user (using Ask AI button)
    const sqChatInstance = this.sqChat();
    if (sqChatInstance) {
      if (question) {
        const messages: RawMessage[] = [{ role: 'user', content: question || '', additionalProperties: { display: true, isUserInput: true } }];
        const userMessage = messages[messages.length - 1];
        this.initChat = { messages } as InitChat;
      } else {
        this.initChat = undefined;
      }

      sqChatInstance.submitQuestion();

      // do not forget to trigger the change detection manually
      this.cdr.detectChanges();
    } else {
      console.error('sqChat instance is not defined');
    }
  }

  attachToChat(ids: string[]): void {
    this.sqChat()?.attachToChat(ids);
  }
}

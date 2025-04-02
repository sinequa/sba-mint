import {
  Component,
  DestroyRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  runInInjectionContext,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter } from 'rxjs';

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

import { AppStore, buildQuery, DrawerStackService, NavigationService, PreviewHighlights, SelectionStore, UserSettingsStore } from '@sinequa/atomic-angular';
import { Article } from '@sinequa/atomic';

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

  defaultQueryName = computed(() => this.appStore.getDefaultQuery()?.name || '_query');
  query = new Q(this.defaultQueryName());

  getChatConfig(config: ChatConfig): void {
    this.config.set(config);
    this.configOutput.emit(config);
  }

  constructor(
    destroyRef: DestroyRef,
    private readonly injector: Injector
  ) {
    // event to watch
    const loginService$ = this.loginService.events.pipe(filter(e => e.type === 'login-complete'));
    const navigationEnd$ = this.navigationService.navigationEnd$.pipe(
      takeUntilDestroyed(destroyRef),
      catchError(error => {
        console.error('Unhandled error in navigationEnd', error);
        return [];
      })
    );

    // Combine the observables to trigger when either emits
    combineLatest([loginService$, navigationEnd$]).subscribe(() => {
      const q = runInInjectionContext(this.injector, () => buildQuery());
      this.query = { ...this.query, ...q } as Q;
    });

    afterNextRender(() => {
      this.sqChat()
        ?.chatService?.streaming$.pipe(
          takeUntilDestroyed(destroyRef),
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

    destroyRef.onDestroy(() => console.log('Assistant component destroyed'));
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

  public askAI(messages: RawMessage[]): void {
    // Send the latest message to have it recorded in the audit logs
    if (messages.length) {
      // the latest message is the user's, and it is the one we want in the audit event
      const userMessage = messages[messages.length - 1];

      const instanceService = this.instanceManagerService.getInstance(this.instanceId()!);

      if (instanceService) {
        instanceService.generateAuditEvent('message', {
          duration: 0,
          text: userMessage.content,
          role: userMessage.role,
          rank: messages.length - 1,
          query: JSON.stringify(this.query),
          'is-user-input': true,
          'enabled-functions': this.config()
            ?.defaultValues.functions?.filter(func => func.enabled)
            .map(func => func.name),
          'additional-workflow-properties': JSON.stringify(this.config()?.additionalWorkflowProperties)
        });
      }
    }

    this.initChat = { messages } as InitChat;
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
}

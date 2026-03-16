import { afterNextRender, Component, computed, DestroyRef, effect, inject, input, output, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HubConnection } from '@microsoft/signalr';
import { getState } from '@ngrx/signals';
import { catchError, of } from 'rxjs';

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

import { Article, error, Query } from '@sinequa/atomic';
import {
  AppStore,
  DrawerStackService,
  PreviewHighlights,
  PreviewService,
  PrincipalStore,
  QueryParamsStore,
  SelectionStore,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import { cn } from '@sinequa/ui';

@Component({
  selector: 'assistant, Assistant',
  imports: [ChatComponent, ChatSettingsV3Component],
  template: `
    @if (isChatInitialized() || showAssistant()) {
      @for (key of [assistantKey()]; track key) {
        <sq-chat-v3
          [class]="cn('prose dark:prose-invert prose-sm prose-p:m-0 prose-ul:gap-1! prose-ol:gap-1! prose-li:m-0 prose-li:p-0', class())"
          #sqChat
          [query]="_query"
          [chat]="initChat"
          [instanceId]="instanceId()"
          (openPreview)="handlePreview($event)"
          (openDocument)="handleRedirect($event)"
          (config)="getChatConfig($event)"
          (connection)="onConnection.emit($event)"
          (suggestAction)="handleSuggestAction($event)"
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
    }
  `,
  styleUrl: './assistant.css',
  host: {
    '[attr.no-progress]': 'noProgress'
  },
  encapsulation: ViewEncapsulation.None
})
export class AssistantComponent {
  cn = cn;
  sqChat = viewChild(ChatComponent);

  // Inject services
  private destroyRef: DestroyRef = inject(DestroyRef);
  userSettingsStore = inject(UserSettingsStore);
  appStore = inject(AppStore);
  selectionStore = inject(SelectionStore);
  protected readonly previewService = inject(PreviewService);

  class = input<string>('');
  // Used to initialize the chat unconditionally
  showAssistant = input<boolean | undefined>(false);
  instanceId = input.required<string>();

  showProgress = input<boolean>(false);
  messageHandlers = input<Map<string, MessageHandler<any>>>(new Map());

  isStreaming = output<boolean>();
  configOutput = output<ChatConfig | undefined>();
  onConnection = output<HubConnection>();
  onReady = output<boolean>();

  // used to initialize the chat when the user clicks on the Ask AI button or when the component is created without "question"
  isChatInitialized = signal<boolean>(false);

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
  _query = { name: this.defaultQueryName() };
  query = input<Query>();

  getChatConfig(config: ChatConfig): void {
    this.config.set(config);
    this.configOutput.emit(config);
  }

  /* To force the recreation of the assistant component when the principal changes,*/
  readonly principalStore = inject(PrincipalStore);
  // Add to your component class
  assistantKey = signal(0);
  // Call this method when you need to recreate
  protected recreateAssistant() {
    this.assistantKey.update(v => v + 1);
  }
  /* End of assistant recreation code */

  constructor() {
    effect(() => {
      // each time the principal store updates, we recreate the assistant component to make sure it uses the latest principal
      getState(this.principalStore);
      this.recreateAssistant();
    });

    effect(() => {
      // each time the query params store changes, we need to update the query object
      if (this.instanceId() === undefined) return;

      if (!this.query()) {
        const q = this.queryParamsStore.getQuery();
        this._query = { ...this._query, ...q };
      } else {
        this._query = { ...this._query, ...this.query() };
      }
    });

    effect(() => {
      if (this.sqChat() === undefined) return;

      this.sqChat()
        ?.chatService?.streaming$.pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(err => {
            error('Unhandled error in streaming', err);
            return [];
          })
        )
        .subscribe({
          next: streaming => this.isStreaming.emit(streaming),
          error: err => error('Error in streaming', err)
        });

      this.sqChat()
        ?.chatService?.initProcess$.pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(err => {
            error('Unhandled error in init process', err);
            return of(false);
          })
        )
        .subscribe({
          next: value => this.onReady.emit(value)
        });
    });

    effect(() => {
      // each time the selection store changes, we need to update the attached IDs
      const assistantIdsToAttach = this.selectionStore.assistantIdsToAttach();
      this.attachToChat(assistantIdsToAttach);
    });

    afterNextRender(() => {
      // ATTENTION: takeUntilDestroyed works only in the context of a component
      // that's why we need to use a reference of the DestroyRef class here

      // once the component is created, we need to attach the assistantIdsToAttach to the chat if any
      const assistantIdsToAttach = this.selectionStore.assistantIdsToAttach();
      this.attachToChat(assistantIdsToAttach);
    });
  }

  handleCancel(event: ChatConfig) {
    this.open.set(false);
  }

  handleUpdate(event: ChatConfig) {
    const assistants = this.userSettingsStore.assistants();
    assistants[this.instanceId()!] = event;

    this.userSettingsStore.updateAssistantSettings(assistants);
    this.open.set(false);
  }

  handlePreview(event: ChatContextAttachment, withQueryText = true) {
    this.drawerStack.replace(event.record as Article);

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

    const partId = event.$partId !== undefined ? event.$partId! - 1 : undefined;
    if (partId) {
      this.previewService.events.set('scrollTo');
      this.previewService.sendMessage({ action: 'select', id: `snippet_${partId}`, usePassageHighlighter: true });
    }
  }

  public newChat(): void {
    try {
      this.sqChat()?.newChat();
    } catch (err) {
      error('Error while starting a new chat', err);
    }
  }

  handleSuggestAction(action: SuggestedAction) {
    switch (action.type) {
      case 'Prefill':
        this.insertText(action.content);
        break;
      case 'Submit':
        this.submitQuestion(action.content);
        break;
      default:
        error(`Unknown suggested action type: ${action.type}`);
    }
  }

  handleRedirect($event: any) {
    const url = $event.url1;

    if (url && typeof url === 'string' && url.trim() !== '') {
      window.open(url, '_blank');
    }
  }

  /**
   * Initializes an AI chat session with an optional question.
   *
   * If a question is provided and a valid assistant configuration exists, creates an initial chat
   * with a system message containing the assistant's default system prompt and a user message
   * with the provided question. The system message is hidden from display while the user message
   * is marked for display and as user input.
   *
   * @param question - Optional initial question to start the chat with
   */
  askAI(question?: string) {
    // if the user comes from the search page, we need to set the query text to the one entered by the user (using Ask AI button)
    // when the sqChat component is created, we need to set the query text to the one entered by the user (using Ask AI button)
    const config = this.appStore.assistants()[this.instanceId()!];

    if (question && config) {
      const systemMsg = { role: 'system', content: config.defaultValues.systemPrompt, additionalProperties: { display: false } } as RawMessage;
      const messages: RawMessage[] = [
        systemMsg,
        {
          role: 'user',
          content: question || '',
          additionalProperties: { display: true, isUserInput: true, additionalWorkflowProperties: config.additionalWorkflowProperties }
        }
      ];
      this.initChat = { messages } as InitChat;
    } else {
      this.initChat = undefined;
    }
    this.isChatInitialized.set(true);
  }

  /**
   * Attaches the specified items to the current chat session.
   *
   * @param ids - An array of string identifiers for the items to attach to the chat.
   *              If the array is empty or null/undefined, the operation is skipped.
   *
   * @remarks
   * This method requires an active sqChat instance. If the instance is not available,
   * an error will be logged and the operation will fail silently.
   *
   * @example
   * ```typescript
   * // Attach multiple items to chat
   * assistant.attachToChat(['item1', 'item2', 'item3']);
   *
   * // No operation performed for empty array
   * assistant.attachToChat([]);
   * ```
   */
  attachToChat(ids: string[]): void {
    if (!ids || ids.length === 0) return;

    const sqChatInstance = this.sqChat();
    if (sqChatInstance) {
      sqChatInstance.attachToChat(ids);
    } else {
      error('sqChat instance is not defined');
    }
  }

  // Manage suggestions actions

  /**
   * Submits a question to the chat assistant.
   *
   * @param question - The question string to be submitted to the chat
   *
   * @remarks
   * This method retrieves the current chat instance and, if available,
   * sets the question and triggers the submission process.
   */
  submitQuestion(question: string) {
    const chat = this.sqChat();
    if (chat) {
      chat.question = question;
      chat.submitQuestion();
    }
  }

  /**
   * Inserts text at the current cursor position in the chat question input field.
   *
   * @param text - The text to insert at the cursor position
   *
   * @remarks
   * This method retrieves the current chat component and its question input element,
   * then inserts the provided text at the current cursor selection. If no cursor
   * position is available or the chat/input elements are not found, the operation
   * is silently ignored.
   *
   * The method handles text insertion by:
   * - Getting the current selection start and end positions
   * - Splitting the existing question text at the selection
   * - Inserting the new text between the split portions
   * - Updating both the component's question property and the input element's value
   */
  insertText(text: string): void {
    const chat = this.sqChat();
    if (chat) {
      // HTMLInputElement within the ChatComponent
      const questionInput = chat.questionInput?.nativeElement;
      if (!questionInput) {
        return;
      }
      // insert text at cursor position
      const start = questionInput.selectionStart;
      const end = questionInput.selectionEnd;
      if (start === undefined || end === undefined) {
        return;
      }
      // insert text at cursor position
      chat.question = chat.question.substring(0, start) + text + chat.question.substring(end, chat.question.length);
      questionInput.value = chat.question;
    }
  }
}

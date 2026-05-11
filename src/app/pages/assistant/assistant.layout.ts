import { ChangeDetectorRef, Component, computed, DestroyRef, effect, inject, input, signal, viewChild } from '@angular/core';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { HubConnection } from '@microsoft/signalr';
import { getState } from '@ngrx/signals';

import { SavedChat, SavedChatsComponent } from '@sinequa/assistant/chat';
import { CCApp, fetchQuery, globalConfig, error, Query, SpellingCorrectionMode } from '@sinequa/atomic';
import {
  AggregationComponent,
  AggregationsStore,
  ApplicationService,
  AppStore,
  DrawerStackService,
  PrincipalStore,
  QueryParamsStore,
  SelectionStore
} from '@sinequa/atomic-angular';
import { ButtonComponent, cn, PageHeaderComponent } from '@sinequa/ui';

import { firstValueFrom, map, skip, take, timeout } from 'rxjs';
import { AssistantComponent } from '../../components/assistant/assistant';
import { injectUrlQueryParamsSync } from '../../../composables/url-query-params-sync';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
import { AssistantUploadComponent } from '../../../components/assistant/document-upload/assistant-upload.component';
import { OnRouteAttached } from '@config/custom-reuse-strategy';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'assistant-layout, AssistantLayout',
  imports: [
    TranslocoPipe,
    AssistantComponent,
    SavedChatsComponent,
    AssistantUploadComponent,
    AggregationComponent,
    PageHeaderComponent,
    NavbarComponent,
    ButtonComponent,
    AppSidebarComponent
  ],
  providers: [provideTranslocoScope('filters')],
  template: `
    <PageHeader>
      <app-navbar [showInput]="false" [showMenu]="false" class="layout-search py-4" />
    </PageHeader>

    <div
      [class]="
        cn(
          'mt-16 ml-18 grid h-[calc(100vh-4rem)] translate-x-0 grid-cols-1 overflow-hidden transition duration-300 ease-in-out md:grid-cols-[.65fr_1fr] lg:grid-cols-[25%_1fr]',
          opened() && '-translate-x-[25%] md:grid-cols-[25%_50%]'
        )
      ">
      <div [class]="cn('scrollbar-stable scrollbar-thin hidden h-full overflow-y-auto opacity-0 md:block', !opened() && 'p-4 opacity-100')">
        <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
        @for (key of [assistantKey()]; track key) {
          @if (showSavedChats()) {
            <section class="border-foreground/10 dark:bg-menu shadow' h-56 max-h-56 rounded-2xl border p-4">
              <div class="flex items-center justify-between">
                <h3 class="text-muted-foreground pointer-events-none font-semibold">
                  <i class="far fa-comments me-1"></i>
                  {{ 'assistant.saved-chats' | transloco }}
                </h3>
                <button
                  variant="ghost"
                  size="icon"
                  [title]="'assistant.new-discussion' | transloco"
                  [attr.aria-label]="'assistant.new-discussion' | transloco"
                  (click)="startNewChat()">
                  <i class="far fa-plus"></i>
                </button>
              </div>
              <!-- height of the saved chat component is 100% of the parent's height - 2rem (padding)  -->
              <sq-saved-chats-v3 class="block h-[calc(100%-2rem)] overflow-auto" [instanceId]="instanceId()" (load)="handleLoadSavedChat($event)">
              </sq-saved-chats-v3>
            </section>
          }
        }
        <section class="pt-6">
          <Aggregation
            #treepath
            name="Sources"
            column="treepath"
            showFiltersCount
            [collapsible]="true"
            class="border-foreground/10 dark:bg-menu rounded-2xl border p-4 shadow" />
        </section>
        <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
        @for (key of [assistantKey()]; track key) {
          @if (showDocumentUploader()) {
            <assistant-upload [instanceId]="instanceId()" />
          }
        }
      </div>
      @if (query()) {
        <div class="overflow-hidden">
          <Assistant class="inline" [query]="query()" [instanceId]="instanceId()" (onReady)="handleReady($event)" (onConnection)="handleConnection($event)" />
        </div>
      }
    </div>
    <app-sidebar class="fixed top-0 h-full" [backLevel]="backLevel" />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        color: var(--color-foreground);
      }
    `
  ]
})
export class AssistantLayoutComponent implements OnRouteAttached {
  cn = cn;
  chat = viewChild(AssistantComponent);

  drawerStackService = inject(DrawerStackService);
  opened = computed(() => this.drawerStackService.isOpened());

  private readonly appStore = inject(AppStore);
  private readonly appFeatures = this.appStore.general()?.features;
  private readonly aggregationStore = inject(AggregationsStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly applicationService = inject(ApplicationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  query = signal<Query | undefined>(undefined);

  readonly instanceId = computed(() => {
    const { usePrefixName = false } = this.appFeatures?.assistant || {};
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-standalone-assistant`;
    }
    return `standalone-assistant`;
  });

  // this is the assistant component who triggers the connection is established
  connectionEstablished = signal(false);

  // this is used to know if the assistant is ready to use (i.e. the assistant is ready to receive queries)
  isAssistantReady = signal(false);

  // used to know how many times we have to go back to return to the search page (decreases at each query params change)
  backLevel = 0;

  // this is used to know if the saved chats component should be displayed
  readonly allowSavedChats = computed(() => Boolean(this.appStore.assistants()[this.instanceId()]?.['savedChatSettings']?.['display']));

  // this is used to know if the document uploader component should be displayed
  readonly allowDocumentUploader = computed(() => Boolean(this.appStore.customizationJson()?.['documentsUploadSettings']?.['enabled']));

  // this is used to display the saved chats component
  readonly showSavedChats = computed(() => this.allowSavedChats() && this.connectionEstablished() && this.isAssistantReady());

  // this is used to display the saved chats component
  readonly showDocumentUploader = computed(() => this.allowDocumentUploader() && this.connectionEstablished() && this.isAssistantReady());

  // url query param input bindings
  readonly q = input<string>();
  readonly t = input<string>();
  readonly b = input<string>();
  readonly s = input<string>();
  readonly f = input<string>();
  readonly n = input<string>();
  readonly c = input<SpellingCorrectionMode>();

  /* To force the recreation of the assistant component when the principal changes,*/
  readonly principalStore = inject(PrincipalStore);
  // Add to your component class
  assistantKey = signal(0);
  // Call this method when you need to recreate
  recreateAssistant() {
    this.assistantKey.update(v => v + 1);
  }
  /* End of assistant recreation code */

  // Local storage key for persisting chat ID
  private readonly STORAGE_KEY = 'assistant_current_chat_id';

  constructor() {
    effect(() => {
      // each time the principal store updates, we recreate the assistant component to make sure it uses the latest principal
      const principal = getState(this.principalStore);
      const { userOverrideActive } = globalConfig;
      // reload the assistant if the principal changes and the user override is active
      if (principal && userOverrideActive) {
        this.recreateAssistant();
        const chat = this.chat();
        if (chat && this.isAssistantReady()) {
          // also start a new chat
          this.startNewChat();
        }
      }
    });

    // Synchronize URL query params ↔ QueryParamsStore (bidirectional)
    injectUrlQueryParamsSync({ q: this.q, t: this.t, b: this.b, s: this.s, f: this.f, n: this.n, c: this.c });

    // React to store updates to keep the local query signal in sync
    effect(() => {
      getState(this.queryParamsStore);
      this.query.set(this.queryParamsStore.getQuery());
      this.backLevel--;
    });

    effect(() => {
      // force the change detection when the AggregationStore is updated.
      // This is needed because we use the ChatComponent which is not a signal component (i.e Angular v14)
      getState(this.aggregationStore);
      this.cdr.detectChanges();
    });

    effect(() => {
      const question = this.q();
      this.chat()?.askAI(question);
    });

    // react to drawer state changes to update the application title when the drawer is closed
    effect(() => {
      if (!this.drawerStackService.isOpened()) {
        this.applicationService.setTitle('Assistant');
      }
    });

    // when the component is initialized, we want to set the application title and clear the selection store
    this.initialize();
  }

  onRouteAttached(): void {
    this.initialize();
  }

  private initialize() {
    // react to drawer state changes to update the application title when the drawer is closed
    this.applicationService.setTitle('Assistant');
    // clear the selection store
    // this is needed to avoid the selection store to be populated with the assistant queries
    this.selectionStore.clear();

    // this is needed to populate the aggregation with the sources as no query is sent to the server
    this.getFirstPageQuery();
  }

  async getFirstPageQuery() {
    const query = this.appStore.getDefaultQuery() || { name: '_default' };
    const response = await fetchQuery({ isFirstPage: true, name: query.name });
    this.aggregationStore.update(response.aggregations);
  }

  handleConnection(connection: HubConnection) {
    // to properly instanciate the saved-chats component, we need to wait for the connection to be established
    if (connection.state === 'Connected') {
      this.connectionEstablished.set(true);
    }
  }

  startNewChat() {
    const assistantComponent = this.chat();
    if (!assistantComponent) {
      return;
    }

    // Remove previous chat id first to avoid restoring old chat after F5.
    localStorage.removeItem(this.STORAGE_KEY);
    assistantComponent.newChat();

    const newChatId = assistantComponent.sqChat()?.chatService?.chatId;
    if (newChatId) {
      localStorage.setItem(this.STORAGE_KEY, newChatId);
    }
  }

  handleReady(ready: boolean) {
    if (!ready) {
      return;
    }

    this.isAssistantReady.set(true);

    // Load the saved chat from local storage if it exists
    this.loadSavedChatFromStorage();
  }

  /**
   * Loads a saved chat from localStorage and restores it if it exists.
   *
   * This function retrieves a stored chat ID from localStorage and attempts to
   * load the corresponding saved chat from the chat service. If the chat exists
   * in the saved chats list, it will be restored; otherwise, a new chat will be started.
   *
   * The subscription automatically unsubscribes when the component is destroyed
   * using `takeUntilDestroyed`.
   *
   * @returns {void}
   *
   * @example
   * // Called after the assistant is ready
   * this.loadSavedChatFromStorage();
   *
   * @remarks
   * - The function does nothing if no chat ID is found in localStorage
   * - The function does nothing if the chat service or savedChats$ observable is unavailable
   * - The subscription uses `skip(1)` to ignore the initial empty state
   * - Errors during chat loading are logged to the console but not thrown
   */
  private loadSavedChatFromStorage(): void {
    const storedChatId = localStorage.getItem(this.STORAGE_KEY);
    if (!storedChatId) {
      return;
    }

    const chatService = this.chat()?.sqChat()?.chatService;
    if (!chatService?.savedChats$) {
      return;
    }

    chatService.savedChats$.pipe(skip(1), take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: chats => {
        const chatExists = chats.some(chat => chat.id === storedChatId);
        if (chatExists) {
          this.handleLoadSavedChat({ id: storedChatId } as SavedChat);
        } else {
          this.startNewChat();
        }
      },
      error: err => {
        error('Error loading saved chats:', err);
      }
    });
  }

  /**
   * Loads a saved chat and updates the query signal with the first user message content.
   *
   * This method fetches the saved chat history, locates the first user message,
   * and updates the query signal with its content.
   *
   * @param savedChat - The saved chat object containing the chat ID to load
   * @returns A promise that resolves when the saved chat has been loaded and processed
   *
   * @remarks
   * - Requires a valid chat service instance to be available
   * - Only processes messages with role 'user' that have content
   * - Updates the query signal's text property with the first user message content
   * - If no chat service is available or no user message is found, the method returns early
   */
  async handleLoadSavedChat(savedChat: SavedChat) {
    localStorage.setItem(this.STORAGE_KEY, savedChat.id);

    const assistantComponent = this.chat();
    if (!assistantComponent) {
      console.warn('Assistant component not available');
      return;
    }

    const chatService = assistantComponent.sqChat()?.chatService;
    if (!chatService) {
      console.warn('Chat service not available');
      return;
    }

    // Prevent loading the same chat again
    if (chatService.chatId === savedChat.id) {
      return;
    }

    try {
      // Use the loadSavedChat$ subject to trigger loading
      chatService.loadSavedChat$.next(savedChat);

      // Generate/Set the chat ID to the loaded chat's ID
      chatService.generateChatId(savedChat.id);

      // Optional: Fetch the history to get the first user message
      const response = await firstValueFrom(chatService.getSavedChat(savedChat.id));
      const history = response?.history || [];

      // Find the first user message to pre-populate the query input
      const firstUserMessage = history.find(msg => msg.role === 'user' && msg.content);
      if (firstUserMessage) {
        // Small delay to ensure the chat component has processed the loaded chat
        setTimeout(() => {
          this.query.update(q => {
            if (q && firstUserMessage) {
              return { ...q, text: firstUserMessage.content as string };
            }
            return q;
          });
        }, 100);
      }

      this.cdr.detectChanges();
    } catch (err) {
      error('Error loading saved chat:', err);
    }
  }
}

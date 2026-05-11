import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { HubConnection } from '@microsoft/signalr';
import { getState } from '@ngrx/signals';

import { SavedChat, SavedChatsComponent } from '@sinequa/assistant/chat';
import { CCApp, fetchQuery, Query, SpellingCorrectionMode } from '@sinequa/atomic';
import {
  AggregationComponent,
  AggregationsStore,
  ApplicationService,
  AppStore,
  PrincipalStore,
  QueryParamsStore,
  SelectionStore
} from '@sinequa/atomic-angular';
import {
  BreakpointObserverService,
  ButtonComponent,
  cn,
  SheetService,
  SidebarGroupComponent,
  SidebarGroupContentComponent,
  SidebarGroupLabelComponent,
  SidebarMenuButtonComponent,
  SidebarMenuComponent,
  SidebarProviderComponent,
  SidebarService,
  SidebarTriggerComponent
} from '@sinequa/ui';

import { AssistantComponent } from '@components/assistant/assistant';
import { injectUrlQueryParamsSync } from '../../../composables/url-query-params-sync';
import { SidebarMainComponent } from '@components/sidebar/sidebar';
import { AssistantUploadComponent } from '@components/assistant/document-upload/assistant-upload.component';
import { OnRouteAttached } from '@config/custom-reuse-strategy';

@Component({
  selector: 'assistant-layout, AssistantLayout',
  imports: [
    TranslocoPipe,
    AssistantComponent,
    SavedChatsComponent,
    AssistantUploadComponent,
    AggregationComponent,
    ButtonComponent,
    SidebarProviderComponent,
    SidebarMainComponent,
    SidebarTriggerComponent,
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    SidebarGroupContentComponent,
    SidebarMenuComponent,
    SidebarMenuButtonComponent
  ],
  providers: [SidebarService, SheetService, provideTranslocoScope('filters')],
  template: `
    <sidebar-provider [style.--sidebar-width]="'12rem'" [style.--sidebar-width-mobile]="'20rem'" [style.--sidebar-width-icon]="'3rem'">
      <main-sidebar triggerName="sidebar-assistant">
        <div class="grid h-[calc(100vh-1rem)] translate-x-0 grid-cols-1 overflow-hidden transition duration-300 ease-in-out md:grid-cols-[300px_1fr]">
          <div class="scrollbar-stable scrollbar-thin hidden h-full space-y-2 overflow-y-auto pt-2 pb-2 pl-2 md:block">
            <sidebar-trigger />

            <!-- tricky way to force Angular to recreate the assistant component when the principal changes -->
            @for (key of [assistantKey()]; track key) {
              @if (showSavedChats()) {
                <section class="border-foreground/10 h-56 max-h-56 rounded-2xl border p-4">
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
                      (click)="chat()?.newChat()">
                      <i class="far fa-plus"></i>
                    </button>
                  </div>
                  <!-- height of the saved chat component is 100% of the parent's height - 2rem (padding)  -->
                  <sq-saved-chats-v3 class="block h-[calc(100%-2rem)] overflow-auto" [instanceId]="instanceId()" (load)="handleLoadSavedChat($event)">
                  </sq-saved-chats-v3>
                </section>
              }
            }
            <section>
              <Aggregation
                #treepath
                name="Sources"
                column="treepath"
                showFiltersCount
                [collapsible]="true"
                class="border-foreground/10 rounded-2xl border p-4" />
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
              <sidebar-trigger class="mt-2 ml-1 md:hidden" />

              <Assistant
                class="inline"
                [query]="query()"
                [instanceId]="instanceId()"
                (onReady)="handleReady($event)"
                (onConnection)="handleConnection($event)" />
            </div>
          }
        </div>

        @let isMobile = breakpointObserverService.isMobile();
        @if (isMobile) {
          <sidebar-group slot="sidebar-extras">
            <sidebar-group-label>Assistant</sidebar-group-label>
            <sidebar-group-content>
              <sidebar-menu>
                <sidebar-menu-button (click)="chat()?.newChat(); sheetService.toggle()">
                  <i class="far fa-plus"></i>
                  <span sr-only>{{ 'assistant.new-discussion' | transloco }}</span>
                </sidebar-menu-button>
              </sidebar-menu>
            </sidebar-group-content>
          </sidebar-group>
        }
      </main-sidebar>
    </sidebar-provider>
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

  breakpointObserverService = inject(BreakpointObserverService);
  sidebarService = inject(SidebarService);
  sheetService = inject(SheetService);

  private readonly appStore = inject(AppStore);
  private readonly appFeatures = this.appStore.general()?.features;
  private readonly aggregationStore = inject(AggregationsStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly applicationService = inject(ApplicationService);
  private readonly cdr = inject(ChangeDetectorRef);

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

  constructor() {
    effect(() => {
      // each time the principal store updates, we recreate the assistant component to make sure it uses the latest principal
      getState(this.principalStore);
      this.recreateAssistant();
      const chat = this.chat();
      if (chat && this.isAssistantReady()) {
        // also start a new chat
        this.chat()?.newChat();
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
    this.applicationService.setTitle('Assistant');

    // when the component is initialized, we want to set the application title and clear the selection store
    this.initialize();
  }

  onRouteAttached(): void {
    this.initialize();
  }

  private initialize() {
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

  handleReady(ready: boolean) {
    if (ready) {
      this.isAssistantReady.set(true);
    }
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
    // 1. fetch the saved chat to get its history
    // 2. find the first user message in the history
    // 3. update the query signal with the first user message content
    const chatService = this.chat()?.sqChat()?.chatService;
    if (!chatService) {
      return;
    }
    const response = await firstValueFrom(chatService.getSavedChat(savedChat.id));
    const history = response?.history || [];
    const firstUserMessage = history.find(msg => msg.role === 'user' && msg.content);
    if (firstUserMessage) {
      this.query.update(q => {
        if (q && firstUserMessage) {
          const newQuery = { ...q };
          newQuery.text = firstUserMessage.content as string;
          return newQuery;
        }
        return q;
      });
    }
  }
}

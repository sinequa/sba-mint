import { ChangeDetectorRef, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { HubConnection } from '@microsoft/signalr';
import { getState } from '@ngrx/signals';

import { SavedChatsComponent } from '@sinequa/assistant/chat';
import { CCApp, fetchQuery } from '@sinequa/atomic';
import { AggregationComponent, AggregationsStore, APP_FEATURES, AppStore, DrawerStackService, QueryParamsStore, SelectionStore } from '@sinequa/atomic-angular';
import { ButtonComponent, cn, PageHeaderComponent } from '@sinequa/ui';

import { AssistantComponent } from '../../components/assistant/assistant';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
import { AssistantUploadComponent } from './document-upload/assistant-upload.component';

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

    <div class="mt-[65px] ml-18 flex h-full">
      <div
        [class]="
          cn(
            'sticky top-[66px] hidden h-full w-1/4 p-4 transition duration-300 ease-in-out lg:block',
            opened() ? 'z-[-1] -translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'
          )
        ">
        @if (showSavedChats()) {
          <section class="border-foreground/18 bg-menu h-56 max-h-56 rounded-2xl border p-4 shadow">
            <div class="flex items-center justify-between">
              <h3 class="text-muted-foreground pointer-events-none text-sm font-semibold">
                <i class="far fa-comments me-1"></i>
                {{ 'assistant.saved-chats' | transloco }}
              </h3>
              <button
                variant="ghost"
                [title]="'assistant.new-discussion' | transloco"
                [attr.aria-label]="'assistant.new-discussion' | transloco"
                (click)="chat()?.newChat()">
                <i class="far fa-plus"></i>
              </button>
            </div>
            <!-- height of the saved chat component is 100% of the parent's height - 2rem (padding)  -->
            <sq-saved-chats-v3 class="block h-[calc(100%-2rem)] overflow-auto" [instanceId]="instanceId()"> </sq-saved-chats-v3>
          </section>
        }
        <section class="pt-6">
          <Aggregation name="Sources" column="treepath" [showCount]="true" class="border-foreground/18 bg-menu h-[540px] rounded-2xl border p-4 shadow" />
        </section>
        @if (showDocumentUploader()) {
          <assistant-upload [instanceId]="instanceId()" />
        }
      </div>
      <div [class]="cn('transition duration-300 ease-in-out', opened() ? 'w-1/2 -translate-x-1/2' : 'w-3/4 translate-x-0')">
        <Assistant [query]="query" [instanceId]="instanceId()" (onReady)="handleReady($event)" (onConnection)="handleConnection($event)" />
      </div>
    </div>
    <app-sidebar class="fixed top-0 h-full" searchRoute="back" />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        color: var(--color-foreground);
      }
    `
  ]
})
export class AssistantLayoutComponent {
  cn = cn;
  chat = viewChild(AssistantComponent);

  drawerStackService = inject(DrawerStackService);
  opened = toSignal(this.drawerStackService.isOpened);

  private readonly appFeatures = inject(APP_FEATURES);
  private readonly appStore = inject(AppStore);
  private readonly aggregationStore = inject(AggregationsStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly cdr = inject(ChangeDetectorRef);

  defaultQueryName = computed(() => this.appStore.getDefaultQuery()?.name || '_query');
  query = { name: this.defaultQueryName() };

  readonly instanceId = computed(() => {
    const {
      assistant: { usePrefixName = true }
    } = this.appFeatures;
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

  // this is used to know if the saved chats component should be displayed
  readonly allowSavedChats = computed(() => Boolean(this.appStore.assistants()[this.instanceId()]?.['savedChatSettings']?.['display']));

  // this is used to know if the document uploader component should be displayed
  readonly allowDocumentUploader = computed(() => Boolean(this.appStore.customizationJson()?.['documentsUploadSettings']?.['enabled']));

  // this is used to display the saved chats component
  readonly showSavedChats = computed(() => this.allowSavedChats() && this.connectionEstablished() && this.isAssistantReady());

  // this is used to display the saved chats component
  readonly showDocumentUploader = computed(() => this.allowDocumentUploader() && this.connectionEstablished() && this.isAssistantReady());

  q = input<string>();

  constructor() {
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

    // clear the selection store
    // this is needed to avoid the selection store to be populated with the assistant queries
    this.selectionStore.clear();

    // this is needed to populate the aggregation with the sources as no query is sent to the server
    this.getFirstPageQuery();
  }

  async getFirstPageQuery() {
    const query = this.appStore.getDefaultQuery() || { name: '_default' };
    const response = await fetchQuery({ isFirstPage: true, name: query.name });
    console.log('first page query', response);
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
}

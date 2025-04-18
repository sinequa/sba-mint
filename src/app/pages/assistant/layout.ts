import { ChangeDetectorRef, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';
import { HubConnection } from '@microsoft/signalr';
import { getState } from '@ngrx/signals';

import { SavedChatsComponent } from '@sinequa/assistant/chat';
import { CCApp, fetchQuery } from '@sinequa/atomic';
import { AggregationComponent, AggregationsStore, AppStore, SelectionStore } from '@sinequa/atomic-angular';

import { AssistantComponent } from '../../components/assistant/assistant';
import { PageHeaderComponent } from '@sinequa/ui';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'assistant-layout, AssistantLayout',
  imports: [AssistantComponent, SavedChatsComponent, AggregationComponent, PageHeaderComponent, NavbarComponent, AppSidebarComponent],
  providers: [provideTranslocoScope('filters')],
  template: `
    <app-sidebar />
    <PageHeader class="z-1 ml-8 bg-white">
      <app-navbar [showInput]="false" [showMenu]="false" class="layout-search py-4" />
    </PageHeader>
    <div class="assistant-container ml-18 flex h-full">
      <div class="flex w-1/4 flex-col p-4">
        @if (showSavedChats()) {
          <div class="h-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow">
            <h3 class="text-lg font-bold">Saved Chats</h3>
            <sq-saved-chats-v3 class="block h-[calc(100%-2rem)] overflow-auto" [instanceId]="instanceId()"> </sq-saved-chats-v3>
          </div>
        }
        <section class="pt-6">
          <Aggregation name="Treepath" class="rounded-2xl border border-gray-200 bg-white p-4 shadow" />
        </section>
      </div>
      <div class="w-3/4 p-4">
        <div class="m-auto h-full w-3xl rounded-2xl border border-orange-200 bg-orange-50 px-4 pb-4 shadow">
          <Assistant class="h-full overflow-auto" [instanceId]="instanceId()" (onReady)="handleReady($event)" (onConnection)="handleConnection($event)" />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `
  ],
  host: {
    class: 'bg-neutral-50 transition-all duration-300 ease-in-out'
  }
})
export class AssistantLayoutComponent {
  chat = viewChild(AssistantComponent);

  private readonly appStore = inject(AppStore);
  private readonly aggregationStore = inject(AggregationsStore);
  private readonly selectionStore = inject(SelectionStore);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly instanceId = computed(() => {
    const { name } = getState(this.appStore) as CCApp;
    return `${name}-standalone-assistant`;
  });

  // this is the assistant component who triggers the connection is established
  connectionEstablished = signal(false);

  // this is used to know if the assistant is ready to use (i.e. the assistant is ready to receive queries)
  isAssistantReady = signal(false);

  // this is used to know if the saved chats component should be displayed
  readonly allowSavedChats = computed(
    () => Boolean(this.appStore.customizationJson()?.['assistants']?.[this.instanceId()]?.['savedChatSettings']?.['display']) ?? false
  );

  // this is used to display the saved chats component
  readonly showSavedChats = computed(() => this.allowSavedChats() && this.connectionEstablished() && this.isAssistantReady());

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

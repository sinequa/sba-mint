import { ChangeDetectorRef, Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';
import { HubConnection } from '@microsoft/signalr';
import { getState } from '@ngrx/signals';

import { SavedChatsComponent } from '@sinequa/assistant/chat';
import { CCApp, fetchQuery } from '@sinequa/atomic';
import { AggregationComponent, AggregationsStore, AppStore, DrawerStackService, SelectionStore } from '@sinequa/atomic-angular';

import { AssistantComponent } from '../../components/assistant/assistant';
import { cn, PageHeaderComponent } from '@sinequa/ui';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'assistant-layout, AssistantLayout',
  imports: [AssistantComponent, SavedChatsComponent, AggregationComponent, PageHeaderComponent, NavbarComponent, AppSidebarComponent],
  providers: [provideTranslocoScope('filters')],
  template: `
    <app-sidebar class="fixed top-0 h-full" />
    <PageHeader class="fixed top-0 z-1 ml-8 w-full bg-white">
      <app-navbar [showInput]="false" [showMenu]="false" class="layout-search py-4" />
    </PageHeader>
    <div class="assistant-container mt-[65px] ml-18 flex h-full">
      <div
        [class]="
          cn('flex w-1/4 flex-col p-4 transition duration-300 ease-in-out', opened() ? 'z-[-1] -translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100')
        ">
        @if (showSavedChats()) {
          <section class="h-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow">
            <h3 class="text-lg font-bold">Saved Chats</h3>
            <sq-saved-chats-v3 class="block h-[calc(100%-2rem)] overflow-auto" [instanceId]="instanceId()"> </sq-saved-chats-v3>
          </section>
        }
        <section class="pt-6">
          <Aggregation name="Treepath" class="rounded-2xl border border-gray-200 bg-white p-4 shadow" />
        </section>
      </div>
      <div [class]="cn('p-4 transition duration-300 ease-in-out', opened() ? 'w-1/2 -translate-x-1/2' : 'w-3/4 translate-x-0')">
        <Assistant [instanceId]="instanceId()" (onReady)="handleReady($event)" (onConnection)="handleConnection($event)" />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class AssistantLayoutComponent {
  cn = cn;
  chat = viewChild(AssistantComponent);

  drawerStackService = inject(DrawerStackService);
  opened = toSignal(this.drawerStackService.isOpened);

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

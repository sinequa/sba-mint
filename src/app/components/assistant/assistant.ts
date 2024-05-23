import { Component, Injector, OnDestroy, ViewChild, ViewEncapsulation, computed, inject, input, runInInjectionContext, signal } from "@angular/core";
import { Subscription, filter } from "rxjs";

import { isASearchRoute } from "@/app/app.routes";
import { NavigationService } from "@/app/services";
import { UserSettingsStore } from "@/app/stores";
import { buildQuery } from "@/app/utils";

import { NgTemplateOutlet } from "@angular/common";
import { ChatComponent, ChatConfig, ChatContextAttachment, ChatSettingsV3Component } from "@sinequa/assistant/chat";
import { Article } from "@sinequa/atomic";
import { Query as Q } from "@sinequa/core/app-utils";
import { LoginService } from "@sinequa/core/login";
import { DrawerStackService } from "../drawer-stack/drawer-stack.service";

type AssistantMode = 'prompt' | 'query';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [NgTemplateOutlet, ChatComponent, ChatSettingsV3Component],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'block p-4' },
  template: `
  <!-- <i role="button" class="far fa-gears" (click)="open.set(true)"></i> -->
  @if(mode() === 'query' && instanceId()) {
    <sq-chat-v3
      class="block"
      #sqChat
      [query]="query"
      [instanceId]="instanceId()"
      (openPreview)="handlePreview($event)"
    />

    <!-- <dialog popover class="z-[1000] p-4 border border-neutral-300 rounded-lg shadow-lg" [open]="open()">
      <ng-container *ngTemplateOutlet="sqChatSettings"></ng-container>
    </dialog> -->
  }
  @else if(instanceId()){
    <sq-chat-v3
      class="block"
      #sqChat
      [instanceId]="instanceId()"
      (openPreview)="handlePreview($event)"
    />

    <!-- <dialog popover class="z-[1000] p-4 border border-neutral-300 rounded-lg shadow-lg" [open]="open()">
      <ng-container *ngTemplateOutlet="sqChatSettings"></ng-container>
    </dialog> -->
  }

  <ng-template #sqChatSettings>
    <sq-chat-settings-v3
        [style.--ast-chat-settings-width]="'570px'"
        [instanceId]="instanceId()"
        (update)="handleUpdate($event)"
        (cancel)="handleCancel($event)"
        >
    </sq-chat-settings-v3>
  </ng-template>

  `,
  styleUrl: './assistant.css',
  encapsulation: ViewEncapsulation.None
})
export class AssistantComponent implements OnDestroy {
  @ViewChild('sqChat') sqChat: ChatComponent;

  // ...
  open = signal(false);

  // If we use the component without inputs, we need to initialize the default values using computed()
  // This is because the input() function is not called when the component is used without inputs
  _mode = input<AssistantMode>("prompt", { alias: "mode" });
  _instanceId = input<string>("my-first-chat", { alias: "instanceId" });
  mode = computed(() => this._mode() || 'prompt');
  instanceId = computed(() => this._instanceId() || 'my-first-chat');

  loginService = inject(LoginService);
  navigationService = inject(NavigationService);
  userSettingsStore = inject(UserSettingsStore);
  drawerStack = inject(DrawerStackService);

  query = new Q('assistant');

  subs = new Subscription();

  constructor(private readonly injector: Injector) {
    console.log("Assistant component initialized", this.query, this.mode(), this.instanceId());
    this.loginService.events.pipe(filter(e => e.type === 'login-complete')).subscribe(() => {
      Object.assign(this.query, runInInjectionContext(this.injector, () => buildQuery()));
    })

    this.subs.add(this.navigationService.navigationEnd$
      .pipe(
        filter((routerEvent) => isASearchRoute(routerEvent.url)),
      )
      .subscribe(() => {
        const q = runInInjectionContext(this.injector, () => buildQuery());
        console.log("Assistant component navigationEnd", q);
        this.query = { ...this.query, ...q } as Q;
      })
    );
  }

  ngOnDestroy(): void {
    console.log("Assistant component destroyed");
    this.subs.unsubscribe();
  }

  handleCancel(event: ChatConfig) {
    console.log("Cancel event: ", event);
    this.open.set(false)
  }

  handleUpdate(event: ChatConfig) {

    const assistants = this.userSettingsStore.assistants();
    assistants[this.instanceId()] = event;

    this.userSettingsStore.updateAssistantSettings(assistants)
    this.open.set(false)
  }

  handlePreview(event: ChatContextAttachment) {
    console.log("Preview event: ", event);
    this.drawerStack.stack(event.record as Article);
  }

  public newChat(): void {
    this.sqChat?.newChat();
  }
}
import { ChangeDetectorRef, Component, Injector, ViewEncapsulation, inject, input, runInInjectionContext, signal } from "@angular/core";
import { filter } from "rxjs";

import { isASearchRoute } from "@/app/app.routes";
import { NavigationService } from "@/app/services";
import { UserSettingsStore } from "@/app/stores";
import { buildQuery } from "@/app/utils";

import { NgTemplateOutlet } from "@angular/common";
import { ChatComponent, ChatConfig, ChatSettingsV3Component } from "@sinequa/assistant/chat";
import { Query as Q } from "@sinequa/core/app-utils";
import { LoginService } from "@sinequa/core/login";

type AssistantMode = 'prompt' | 'query';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [NgTemplateOutlet, ChatComponent, ChatSettingsV3Component],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { class: 'block p-4' },
  template: `
  <i role="button" class="far fa-gears" (click)="open.set(true)"></i>
  @if(mode() === 'query' && instanceId()) {
    <sq-chat-v3
      class="block"
      #sqChat
      [query]="query"
      [instanceId]="instanceId()"/>

    <dialog class="fixed top-[50px] z-[1000] p-4 border border-neutral-300 rounded-lg shadow-lg" [open]="open()">
      <ng-container *ngTemplateOutlet="sqChatSettings"></ng-container>
    </dialog>
  }
  @else if(instanceId()){
    <sq-chat-v3
      class="block"
      #sqChat
      [instanceId]="instanceId()"/>

    <dialog class="fixed top-[50px] z-[1000] p-4 border border-neutral-300 rounded-lg shadow-lg" [open]="open()">
      <ng-container *ngTemplateOutlet="sqChatSettings"></ng-container>
    </dialog>
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
export class AssistantComponent {
  // ...
  open = signal(false);
  mode = input<AssistantMode>("prompt");

  instanceId = input("my-first-chat");

  loginService = inject(LoginService);
  navigationService = inject(NavigationService);
  userSettingsStore = inject(UserSettingsStore);

  cdr = inject(ChangeDetectorRef);

  query = new Q('assistant');

  constructor(private readonly injector: Injector) {
    this.loginService.events.pipe(filter(e => e.type === 'login-complete')).subscribe(() => {
      console.log("Assistant component initialized", this.query);
      Object.assign(this.query, runInInjectionContext(this.injector, () => buildQuery()));
    })

    this.navigationService.navigationEnd$
      .pipe(
        filter((routerEvent) => isASearchRoute(routerEvent.url)),
      )
      .subscribe(() => {
        const q = runInInjectionContext(this.injector, () => buildQuery());
        console.log("Assistant component navigationEnd", q);
        this.query = { ...this.query, ...q } as Q;
      });
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
}
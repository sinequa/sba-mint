import { Component, computed, inject } from '@angular/core';
import { AppStore } from '@sinequa/atomic-angular';
import { getState } from '@ngrx/signals';

import { CCApp, Query } from '@sinequa/atomic';

import { AssistantComponent } from '../../assistant/assistant';

@Component({
  selector: 'assistant-layout, AssistantLayout',
  standalone: true,
  imports: [AssistantComponent],
  template: ` <Assistant class="m-auto my-2 h-full w-1/2 rounded-lg bg-white p-4" [instanceId]="instanceId()" /> `,
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
    class: 'bg-neutral-50'
  }
})
export class AssistantLayoutComponent {
  private appStore = inject(AppStore);

  defaultQueryName = computed(() => this.appStore.getDefaultQuery()?.name || '_query');

  protected query: Query = { name: this.defaultQueryName() };

  readonly instanceId = computed(() => {
    const { name } = getState(this.appStore) as CCApp;
    return `${name}-standalone-assistant`;
  });
}

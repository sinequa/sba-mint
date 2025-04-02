import { Component, computed, inject } from '@angular/core';

import { AssistantComponent } from '../../components/assistant/assistant';
import { AppStore } from '@sinequa/atomic-angular';
import { getState } from '@ngrx/signals';
import { CCApp } from '@sinequa/atomic';

@Component({
  selector: 'assistant-layout, AssistantLayout',
  standalone: true,
  imports: [AssistantComponent],
  template: `
    <div class="m-auto my-2 h-full w-1/2 rounded-lg border border-orange-100 bg-orange-50 p-4">
      <Assistant class="h-full" [instanceId]="instanceId()" />
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
    class: 'bg-neutral-50'
  }
})
export class AssistantLayoutComponent {
  private readonly appStore = inject(AppStore);

  readonly instanceId = computed(() => {
    const { name } = getState(this.appStore) as CCApp;
    return `${name}-standalone-assistant`;
  });
}

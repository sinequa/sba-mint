import { afterNextRender, Component, inject, input } from '@angular/core';
import { getState } from '@ngrx/signals';

import { QueryParamsStore, SelectionStore } from '@sinequa/atomic-angular';

import { PreviewComponent } from '../../components/preview/preview';

@Component({
  selector: 'page-preview',
  imports: [PreviewComponent],
  template: `<preview />`
})
export class PreviewPage {
  selectionStore = inject(SelectionStore);
  protected readonly queryParamStore = inject(QueryParamsStore);

  id = input<string>();

  constructor() {
    afterNextRender(() => {
      const { text = '' } = getState(this.queryParamStore);
      this.selectionStore.update({ id: this.id(), queryText: text });
    });
  }
}

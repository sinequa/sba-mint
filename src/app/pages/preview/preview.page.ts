import { afterNextRender, Component, inject, input } from '@angular/core';
import { PreviewComponent } from '../../components/preview/preview';
import { SelectionStore } from '@sinequa/atomic-angular';

@Component({
  selector: 'page-preview',
  imports: [PreviewComponent],
  template: `<preview />`
})
export class PreviewPage {
  selectionStore = inject(SelectionStore);

  id = input<string>();

  constructor() {
    // Initialization logic can go here if needed
    afterNextRender(() => {
      this.selectionStore.update({ id: this.id() });
    });
  }
}

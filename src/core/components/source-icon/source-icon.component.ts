import { Component, computed, inject, input } from '@angular/core';

import { SourceIconPipe } from '@sinequa/atomic-angular';
import { AppStore } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-source-icon',
  standalone: true,
  imports: [SourceIconPipe],
  templateUrl: './source-icon.component.html'
})
export class SourceIconComponent {
  collection = input<string[]>();
  appStore = inject(AppStore);

  iconPath = computed(() => {
    const collections = this.collection();
    if (!collections) return undefined;
    const name = collections[0].split("/")[1];
    const sources = this.appStore.sources();
    const path = sources.find((source: { name: string }) => source.name === name)?.iconPath;
    return path;
  });
}

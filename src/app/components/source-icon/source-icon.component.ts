import { SourceIconPipe } from '@/app/pipes';
import { AppStore } from '@/app/stores';
import { Component, computed, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-source-icon',
  standalone: true,
  imports: [SourceIconPipe],
  templateUrl: './source-icon.component.html'
})
export class SourceIconComponent {
  collection = input<string[]>();
  appStore = inject(AppStore);

  faIcon = signal<string>('');
  iconPath = computed(() => {
    const collections = this.collection();
    if (!collections) return undefined;
    const name = collections[0].split("/")[1];
    const sources =  this.appStore.sources();
    const path = sources.find((source) => source.name === name)?.iconPath;
    return path;
  });
}

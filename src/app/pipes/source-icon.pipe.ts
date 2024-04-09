import { AppStore } from '@/app/stores';
import { Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({
  name: 'sourceIcon',
  standalone: true,
  pure: true
})
export class SourceIconPipe implements PipeTransform {
  appStore = inject(AppStore);

  transform(collection: string[]): string {
    if(collection === undefined) {
      return 'far fa-file';
    }
    const name = collection[0].split("/")[1];
    const sources =  this.appStore.sources();
    const icon = sources.find((source) => source.name === name)?.icon;
    return icon || 'far fa-file';
  }
}

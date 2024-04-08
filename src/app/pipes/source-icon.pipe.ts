import { Pipe, PipeTransform } from '@angular/core';
import { appStore } from '@/app/stores';

@Pipe({
  name: 'sourceIcon',
  standalone: true,
  pure: true
})
export class SourceIconPipe implements PipeTransform {
  transform(collection: string[]): string {
    if(collection === undefined) {
      return 'far fa-file';
    }
    const name = collection[0].split("/")[1];
    const sources =  appStore.getSourcesCustomization();
    const icon = sources.find((source) => source.name === name)?.icon;
    return icon || 'far fa-file';
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'treepathToIconClass',
  standalone: true,
  pure: true
})
export class TreepathToIconClassPipe implements PipeTransform {
  transform(treepath: string | undefined): string | undefined {
    if (!treepath) return undefined;

    return 'far fa-file';
  }
}

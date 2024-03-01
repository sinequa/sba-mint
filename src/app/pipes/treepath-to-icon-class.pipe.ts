import { AggregationsService } from '@/app/services/aggregations.service';
import { Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({
  name: 'treepathToIconClass',
  standalone: true,
  pure: true
})
export class TreepathToIconClassPipe implements PipeTransform {
  private readonly aggregations = inject(AggregationsService);

  transform(treepath: string | undefined): string | undefined {
    if (!treepath) return undefined;

    return this.aggregations.getMockAggregation('treepaths')?.find(t => treepath.startsWith(t.label))?.iconClass ?? 'far fa-file';
  }
}

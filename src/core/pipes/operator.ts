import { Pipe, PipeTransform } from "@angular/core";
import { FilterOperator, LegacyFilter } from "@sinequa/atomic";

@Pipe({
  name: 'operator',
  standalone: true,
  pure: true
})
export class OperatorPipe implements PipeTransform {
  transform(filter?: LegacyFilter): string {
    let op = this.transformOperator(filter?.operator);
    if (filter?.operator === 'between') {
      return `&gt; ${filter.start} &le; ${filter.end}`;
    }
    if(filter?.operator === 'and') {
      return filter.display ?? filter.value ?? '';
    }
    return `${op} ${filter?.value || ''}`;
  }

  transformOperator(operator?: FilterOperator): string {
    switch (operator) {
      case 'lt':
        return '&lt;';
      case 'lte':
        return '&le;';
      case 'eq':
        return '=';
      case 'neq':
        return '&ne;';
      case 'gte':
        return '&ge;';
      case 'gt':
        return '&gt;';
      default:
        return ''
    }
  }
}
import { Pipe, PipeTransform } from '@angular/core';

export type RelativeDate = {
  offset: number;
  unit: string;
  isFuture: boolean;
}

@Pipe({
  name: 'relativeDate',
  standalone: true
})
export class RelativeDatePipe implements PipeTransform {
  transform(date: string): string {
    const offset = this.getOffsetFromDate(date);
    return this.formatOffset(offset);
  }

  private formatOffset(offset: RelativeDate): string {
    if (offset.offset === 0) return 'Today';
    if (offset.offset === 1) return offset.isFuture ? 'Tomorrow' : 'Yesterday';

    const unit = offset.offset === 1 ? offset.unit : `${offset.unit}s`;
    return `${offset.offset} ${unit} ${offset.isFuture ? 'from now' : 'ago'}`;
  }

  private getOffsetFromDate(date: string): RelativeDate {
    const target = new Date(date);
    const now = new Date();

    const diffTime = Math.abs(now.getTime() - target.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      offset: diffDays,
      unit: 'day',
      isFuture: target > now
    }
  }
}

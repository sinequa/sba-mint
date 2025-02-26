import { Component, computed, EventEmitter, HostBinding, input, Output } from '@angular/core';

import { AggregationListItem, cn, MenuItemComponent } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipes/syslang';

@Component({
  selector: 'aggregation-row, AggregationRow',
  standalone: true,
  imports: [MenuItemComponent, SyslangPipe],
  templateUrl: './aggregation-row.component.html',
  styles: `
    :host {
      display: block;
      user-select: none;
    }
    :host a {
      padding-left: calc((1rem * var(--level)));
    }
  `
})
export class AggregationRowComponent {
  cn = cn;
  @HostBinding('attr.disabled') get disabled() {
    return this.node().count === 0 ? 'disabled' : null;
  }

  @Output() onSelect = new EventEmitter<AggregationListItem>();
  @Output() onOpen = new EventEmitter<AggregationListItem>();

  node = input.required<AggregationListItem>();

  name = computed(() => {
    const value = this.node().display || this.node().value;
    return typeof value === 'string' ? value : `${value}`;
  });

  select(e: Event, item: AggregationListItem) {
    e.stopImmediatePropagation();
    item.$selected = !item.$selected;

    this.onSelect.emit(item);
  }

  open(e: Event, node: AggregationListItem) {
    // fetch aggregation items
    e.preventDefault();
    e.stopImmediatePropagation();

    if (node.items && node.$opened === true) {
      node.$opened = false;
      return;
    }
    if (node.items && !node.$opened) {
      node.$opened = true;
      return;
    }

    this.onOpen.emit(node);
  }
}

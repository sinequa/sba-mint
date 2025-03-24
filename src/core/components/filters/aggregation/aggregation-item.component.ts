import { Component, computed, EventEmitter, HostBinding, inject, input, Output } from '@angular/core';

import { AggregationListItem, cn, HighlightWordPipe } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipes/syslang';
import { ListItemComponent } from '@sinequa/ui';
import { AggregationComponent } from './aggregation.component';

@Component({
  selector: 'aggregation-item, AggregationItem, aggregationitem',
  standalone: true,
  imports: [HighlightWordPipe, ListItemComponent, SyslangPipe],
  templateUrl: './aggregation-item.component.html',
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
export class AggregationItemComponent {
  cn = cn;
  @HostBinding('attr.disabled') get disabled() {
    return this.node().count === 0 ? 'disabled' : null;
  }

  @Output() onSelect = new EventEmitter<AggregationListItem>();
  @Output() onOpen = new EventEmitter<AggregationListItem>();

  node = input.required<AggregationListItem>();

  searchText = inject(AggregationComponent).searchText;

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

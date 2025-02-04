import { NgClass } from "@angular/common";
import { Component, EventEmitter, HostBinding, Output, computed, input } from "@angular/core";

import { AggregationListItem, cn } from "@sinequa/atomic-angular";

import { SyslangPipe } from "@/core/pipes/syslang";

@Component({
  selector: "aggregation-row, AggregationRow",
  standalone: true,
  imports: [NgClass, SyslangPipe],
  templateUrl: "./aggregation-row.component.html",
  styles: `
    :host {
      display: block;
      user-select: none;
    }
    :host a {
      padding-left: calc((1rem * var(--level)))
    }
    :host:has(input:checked) {
      color: theme('colors.primary');
    }
  `
})
export class AggregationRowComponent {
  cn = cn;
  @HostBinding("attr.disabled") get disabled() { return this.node().count === 0 ? "disabled" : null }

  @Output() onSelect = new EventEmitter<AggregationListItem>();
  @Output() onOpen = new EventEmitter<AggregationListItem>();

  node = input.required<AggregationListItem>();

  @HostBinding("class.selected") get selected() { return this.node().$selected }

  name = computed(() => {
    const value = this.node().display || this.node().value;
    return typeof value === 'string' ? value : `${value}`;
  })

  select(e: Event, item: AggregationListItem) {
    e.stopImmediatePropagation();
    item.$selected = !item.$selected;

    this.onSelect.emit(item);
  }

  open(e: Event, node: AggregationListItem) {
    // fetch aggregation items
    e.preventDefault();
    e.stopImmediatePropagation();

    if(node.items && node.$opened === true) {
      node.$opened = false;
      return;
    }
    if(node.items && (!node.$opened)) {
      node.$opened = true;
      return;
    }

    this.onOpen.emit(node);
  }
}
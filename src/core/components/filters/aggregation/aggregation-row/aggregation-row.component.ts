import { NgClass } from "@angular/common";
import { Component, EventEmitter, HostBinding, Output, input } from "@angular/core";

import { AggregationListEx, AggregationListItem, AggregationTreeEx, cn } from "@sinequa/atomic-angular";

import { SyslangPipe } from "@/core/pipes/syslang";

@Component({
  selector: "app-aggregation-row",
  standalone: true,
  imports: [NgClass, SyslangPipe],
  templateUrl: "./aggregation-row.component.html",
  styles: `
    :host {
      display: block;
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
  aggregation = input.required<AggregationListEx | AggregationTreeEx>();

  @HostBinding("class.selected") get selected() { return this.node().$selected }

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
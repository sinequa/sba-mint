import { SyslangPipe } from "@/core/pipe/syslang";
import { NgClass } from "@angular/common";
import { Component, EventEmitter, HostBinding, Output, input } from "@angular/core";

import { AggregationListEx, AggregationListItem, AggregationTreeEx, cn } from "@sinequa/atomic-angular";

@Component({
  selector: "app-aggregation-row",
  standalone: true,
  imports: [NgClass, SyslangPipe],
  templateUrl: "./aggregation-row.component.html",
  styles: [":host { display: block; }"]
})
export class AggregationRowComponent {
  cn = cn;

  @HostBinding("attr.disabled") get disabled() { return this.item().count === 0 ? "disabled" : null }

  @Output() onSelect = new EventEmitter<AggregationListItem>();
  @Output() onOpen = new EventEmitter<AggregationListItem>();

  item = input.required<AggregationListItem>();
  aggregation = input.required<AggregationListEx | AggregationTreeEx>();

  @HostBinding("class.selected") get selected() { return this.item().$selected }

  select(e: Event, item: AggregationListItem) {
    e.stopImmediatePropagation();
    item.$selected = !item.$selected;

    this.onSelect.emit(item);
  }

  open(e: Event, item: AggregationListItem) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.onOpen.emit(item);
  }
}
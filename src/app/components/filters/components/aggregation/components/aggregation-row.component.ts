import { NgClass } from "@angular/common";
import { Component, EventEmitter, Output, input } from "@angular/core";

import { AggregationListEx, AggregationListItem, AggregationTreeEx } from "@/app/services";

@Component({
  selector: "app-aggregation-row",
  standalone: true,
  imports: [NgClass],
  templateUrl: "./aggregation-row.component.html",
  styles: [":host { display: block; }"]
})
export class AggregationRowComponent {
  @Output() onSelect = new EventEmitter<AggregationListItem>();
  @Output() onOpen = new EventEmitter<AggregationListItem>();

  item = input.required<AggregationListItem>();
  aggregation = input.required<AggregationListEx | AggregationTreeEx>();

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
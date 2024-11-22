import { NgClass } from "@angular/common";
import { Component, ElementRef, inject, input } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { cn, DropdownComponent } from "@sinequa/atomic-angular";
import { AggregationComponent } from "../aggregation/aggregation.component";
import { CFilterEx } from "../filters.models";
import { SyslangPipe } from "../../../pipes/syslang";

@Component({
  selector: 'filter-button, FilterButton',
  standalone: true,
  imports: [NgClass, DropdownComponent, TranslocoPipe, AggregationComponent, SyslangPipe],
  template: `
    <Dropdown [disabled]="filter().disabled">
      <button
        [attr.data-disabled]="filter().disabled"
        [disabled]="filter().disabled || null"
        [ngClass]="cn(
          'btn font-semibold gap-1 w-max',
          filter().count ? 'btn-primary': 'btn-tertiary'
          )">
        @if (filter().icon) {
          <i class="fa-fw {{ filter().icon }} " aria-hidden="true"></i>
        }
        {{ (filter().display || filter().name) | syslang | transloco }}
        @if(filter().isTree && filter().count > 0) {
          <span class="pill size-5 pill-xs pill-ghost bg-white flex place-content-center font-semibold text-blue-600">
            {{ filter().count }}
          </span>
        }
        @else if (filter().count > 1) {
          <span class="pill size-5 pill-xs pill-ghost bg-white flex place-content-center font-semibold text-blue-600">
            <i class="fas fa-plus text-[0.5rem] my-auto " aria-hidden="true"></i>
            {{ filter().count - 1 }}
          </span>
        }
      </button>
      <Aggregation class="dropdown-content w-max"
              dropdown-content
              [name]="filter().name"
              [searchable]="true"
      />
    </Dropdown>
`
}) export class FilterButtonComponent {
  cn = cn;

  nativeElement = inject(ElementRef).nativeElement;

  filter = input.required<CFilterEx>();
}
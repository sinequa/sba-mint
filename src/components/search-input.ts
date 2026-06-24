import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { ButtonComponent, InputGroupAddonComponent, InputGroupComponent, InputGroupInput, SearchIcon, XMarkIcon } from "@sinequa/ui";

@Component({
  selector: "search-input",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, InputGroupComponent, InputGroupAddonComponent, InputGroupInput, SearchIcon, TranslocoPipe, XMarkIcon],
  template: `
    <InputGroup class="group/item">
      <input
        input-group
        type="text"
        [attr.placeholder]="placeholder() | transloco"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        class="mt-1" />
      <InputGroupAddon align="inline-end">
        <button
          size="icon"
          variant="icon"
          [class]="value()
            ? 'rotate-90 opacity-100 cursor-pointer transition-[rotate,opacity] duration-500'
            : 'rotate-0 opacity-0 pointer-events-none transition-[rotate,opacity] duration-500'"
          aria-label="Clear search"
          [tabindex]="value() ? 0 : -1"
          (keydown.enter)="clearSearch($event)"
          (click)="clearSearch($event)">
          <XMarkIcon class="size-4"/>
        </button>
      </InputGroupAddon>
      <InputGroupAddon>
        <SearchIcon
          class="text-foreground size-4 rotate-0 transition-[rotate] duration-500 group-focus-within/item:rotate-90" />
      </InputGroupAddon>
    </InputGroup>
  `
})
export class SearchInputComponent {
  readonly value = model("");
  readonly placeholder = input("search");

  clearSearch(event: Event) {
    event.preventDefault();
    this.value.set("");
  }
}

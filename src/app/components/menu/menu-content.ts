import { Component, inject } from "@angular/core";
import { MenuComponent } from "./menu";

@Component({
  selector: "app-menu-content",
  standalone: true,
  template: `
@if(menu.show()) {
  <ng-content></ng-content>
}
`,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
  `]
})
export class MenuContentComponent {
  menu = inject(MenuComponent);
}
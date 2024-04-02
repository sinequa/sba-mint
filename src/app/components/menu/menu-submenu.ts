import { Component, inject } from "@angular/core";
import { MenuComponent } from "./menu";

@Component({
  selector: "app-menu-submenu",
  standalone: true,
  template: `
@if(menu.submenu()) {
  <ng-content></ng-content>
}
`
})
export class MenuSubmenuComponent {
  menu = inject(MenuComponent);
}
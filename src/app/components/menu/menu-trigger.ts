import { Component, HostListener, inject } from "@angular/core";
import { MenuComponent } from "./menu.component";

@Component({
  selector: "app-menu-trigger",
  standalone: true,
  template: `<ng-content></ng-content>`
})
export class MenuTriggerComponent {
  menu = inject(MenuComponent);

  @HostListener("click", ['$event']) click(e: MouseEvent) {
   this.menu.toggle(e);
  }
}
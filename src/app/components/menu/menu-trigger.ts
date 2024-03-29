import { Directive, HostListener, Input, inject } from "@angular/core";
import { MenuComponent } from "./menu";

@Directive({
  selector: "[menuTrigger]",
  standalone: true
})
export class MenuTriggerDirective {
  @Input() submenu = false;

  menu = inject(MenuComponent);

  @HostListener("click", ['$event']) click(e: MouseEvent) {
    this.submenu ? this.menu.toggleSubmenu(e) : this.menu.toggle(e);
  }
}
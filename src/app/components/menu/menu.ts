import { clickAwayDirective } from '@/app/directives/click-away.directive';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, clickAwayDirective],
  template: `
<div (clickAway)="show.set(false); submenu.set(false)" class="select-none" (click)="toggle($event)">
    <ng-content></ng-content>
</div>
  `
})
export class MenuComponent {
  show = signal(false);
  submenu = signal(false);

  toggle(e: Event) {
    e.stopImmediatePropagation();
    this.show.update(() => !this.show());
  }

  toggleSubmenu(e: Event) {
    e.stopImmediatePropagation();
    this.submenu.update(() => !this.submenu());
  }
}

import { clickAwayDirective } from '@/app/directives/click-away.directive';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, clickAwayDirective],
  templateUrl: './menu.component.html'
})
export class MenuComponent {
  show = signal(false);
  menu = false;

  toggle(e: Event) {
    e.stopImmediatePropagation();
    this.show.update(()=> !this.show());
  }
}

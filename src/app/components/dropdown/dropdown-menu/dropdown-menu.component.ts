import { clickAwayDirective } from '@/app/directives/click-away.directive';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule, clickAwayDirective],
  templateUrl: './dropdown-menu.component.html'
})
export class DropdownMenuComponent {}

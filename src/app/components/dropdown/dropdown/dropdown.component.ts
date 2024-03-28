import { clickAwayDirective } from '@/app/directives/click-away.directive';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, clickAwayDirective, DropdownMenuComponent],
  templateUrl: './dropdown.component.html'
})
export class DropdownComponent {
  @Input() show: boolean;
}

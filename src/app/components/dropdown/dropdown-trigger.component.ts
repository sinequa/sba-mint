import { clickAwayDirective } from '@/app/directives/click-away.directive';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';

@Component({
  selector: 'app-dropdown-trigger',
  standalone: true,
  imports: [CommonModule, clickAwayDirective, DropdownComponent],
  templateUrl: './dropdown-trigger.component.html'
})
export class DropdownTriggerComponent {
  show = false;
  menu = false;
}

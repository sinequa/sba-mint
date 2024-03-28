import { clickAwayDirective } from '@/app/directives/click-away.directive';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, clickAwayDirective],
  templateUrl: './dropdown.component.html'
})
export class DropdownComponent {
  @Input() show: boolean;
}

import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './design-system.component.html',
  styleUrl: './design-system.component.scss'
})
export class DesignSystemComponent {
  public list = [true, true, true, false, true];
  public dividers = [1, 2, 3];
}

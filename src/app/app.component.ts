import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { login } from '@sinequa/atomic';

import { ApplicationService } from '@/app/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  appService = inject(ApplicationService);

  constructor() {
    // Login and initialize the application when the user is logged in
    login().then(value => {
      if(value) {
        this.appService.init();
      }
    });
  }
}
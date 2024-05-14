import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getState } from '@ngrx/signals';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

import { login } from '@sinequa/atomic';

import { ApplicationService } from '@/app/services';

import { ComponentWithLogin } from '@sinequa/core/login';
import { PrincipalStore } from './stores';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent extends ComponentWithLogin{
  appService = inject(ApplicationService);
  principalStore = inject(PrincipalStore);

  // myLoginService = inject(myLoginService);

  constructor() {
    super()
    // Login and initialize the application when the user is logged in
    login().then(value => {
      if (value) {
        this.appService.init().then(() => {
          const { fullName } = getState(this.principalStore).principal;
          toast(`Welcome back ${fullName}!`, { duration: 2000 })
        });
      }
      // this.myLoginService.login();
    });
  }
}
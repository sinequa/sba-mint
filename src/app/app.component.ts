import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getState } from '@ngrx/signals';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

import { login } from '@sinequa/atomic';
import { LoginService } from '@sinequa/core/login';

import { ApplicationService } from '@/app/services';

import { PrincipalStore } from './stores';
import { ApplicationStore } from '@/stores';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  appService = inject(ApplicationService);
  principalStore = inject(PrincipalStore);
applicationStore = inject(ApplicationStore);

  loginService = inject(LoginService);

  constructor() {
    // Login and initialize the application when the user is logged in
    login().then(value => {
      if (value) {
        this.appService.init().then(() => {
          const { fullName } = getState(this.principalStore).principal;
          toast(`Welcome back ${fullName}!`, { duration: 2000 })
        });
        this.loginService.login().subscribe(values => {
          console.log("Login successful!", values);
          this.applicationStore.updateAssistantReady();
        });
      }
    });
  }
}
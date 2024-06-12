import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getState } from '@ngrx/signals';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

import { login } from '@sinequa/atomic';

import { ApplicationService } from '@/app/services';
import { ApplicationStore } from '@/app/stores';

import { DrawerStackComponent } from './components/drawer-stack/drawer-stack.component';
import { BackdropComponent } from './components/drawer/components/backdrop/backdrop.component';
import { PrincipalStore } from './stores';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  appService = inject(ApplicationService);
  principalStore = inject(PrincipalStore);
  applicationStore = inject(ApplicationStore);

  constructor() {
    // Login and initialize the application when the user is logged in
    login().then(value => {
      if (value) {
        this.appService.init().then(() => {
          const { fullName, name } = getState(this.principalStore).principal;
          toast(`Welcome back ${fullName || name}!`, { duration: 2000 })
          this.applicationStore.updateReadyState();
        });
      }
    }).catch(error => {
      toast.error("An error occured while logging in", { description: error, duration: 2000 });
    });
  }
}
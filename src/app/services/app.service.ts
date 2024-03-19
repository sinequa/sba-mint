import { Injectable } from '@angular/core';

import { fetchApp } from '@sinequa/atomic';

import { appStore } from '@/app/stores';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor() {
    fetchApp().then((app) => appStore.set(app));
  }
}

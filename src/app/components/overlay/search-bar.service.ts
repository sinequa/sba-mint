import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchBarService {

  overlayOpen = signal(false);
  recentSearches = signal(["angular","rxjs","signals", "components"]);

  constructor() { }
}

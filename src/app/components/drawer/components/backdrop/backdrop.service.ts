import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackdropService {
  public isVisible = signal(false);

  public show(): void {
    this.isVisible.set(true);
  }
  
  public hide(): void {
    this.isVisible.set(false);
  }
}

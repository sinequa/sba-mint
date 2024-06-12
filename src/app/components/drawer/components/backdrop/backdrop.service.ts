import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackdropService {
  public isVisible = new BehaviorSubject<boolean>(false);

  public show(): void {
    this.isVisible.next(true);
  }

  public hide(): void {
    this.isVisible.next(false);
  }
}

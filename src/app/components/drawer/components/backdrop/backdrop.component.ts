import { Component, HostBinding, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackdropService } from './backdrop.service';

@Component({
  selector: 'app-backdrop',
  standalone: true,
  imports: [],
  templateUrl: './backdrop.component.html',
  styleUrl: './backdrop.component.scss'
})
export class BackdropComponent implements OnDestroy {
  @HostBinding('attr.backdrop-visible')
  public backdropVisible: boolean = false;

  private readonly backdrop = inject(BackdropService);
  private readonly sub = new Subscription();

  constructor() {
    this.sub.add(
      this.backdrop.isVisible.subscribe(state => this.backdropVisible = state)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

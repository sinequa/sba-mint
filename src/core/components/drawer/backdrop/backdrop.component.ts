import { Component, HostBinding, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackdropService } from './backdrop.service';

@Component({
  selector: 'app-backdrop',
  standalone: true,
  imports: [],
  template: ``,
  host: {
    class: 'z-backdrop bg-backdrop absolute bottom-0 left-0 right-0 top-0 hidden select-none'
  },
  styles: [
    `
      :host {
        --backdrop-animation-duration: 250ms;

        animation: hide-backdrop var(--backdrop-animation-duration, 250ms) ease-out;

        &[backdrop-visible='true'] {
          display: block;
          animation: show-backdrop var(--backdrop-animation-duration, 250ms) ease-out;
        }

        @keyframes show-backdrop {
          0% {
            display: none;
            opacity: 0;
          }
          1% {
            display: block;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes hide-backdrop {
          0% {
            display: block;
            opacity: 1;
          }
          99% {
            opacity: 0;
          }
          100% {
            display: none;
          }
        }
      }
    `
  ]
})
export class BackdropComponent implements OnDestroy {
  @HostBinding('attr.backdrop-visible')
  public backdropVisible: boolean = false;

  private readonly backdrop = inject(BackdropService);
  private readonly sub = new Subscription();

  constructor() {
    this.sub.add(this.backdrop.isVisible.subscribe(state => (this.backdropVisible = state)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

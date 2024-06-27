import { Component, HostBinding, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackdropService } from './backdrop.service';

@Component({
  selector: 'app-backdrop',
  standalone: true,
  imports: [],
  template: ``,
  styles: [`
    :host {
      --backdrop-animation-duration: 250ms;

      @apply absolute hidden top-0 bottom-0 left-0 right-0 bg-backdrop select-none;

      z-index: theme('zIndex.backdrop');

      animation: hide-backdrop var(--backdrop-animation-duration, 250ms) ease-out;

      &[backdrop-visible="true"] {
        @apply block;
        animation: show-backdrop var(--backdrop-animation-duration, 250ms) ease-out;
      }

      @keyframes show-backdrop {
        0% {
          @apply opacity-0 hidden;
        }
        1% {
          @apply block;
        }
        100% {
          @apply opacity-100;
        }
      }

      @keyframes hide-backdrop {
        0% {
          @apply block opacity-100;
        }
        99% {
          @apply opacity-0;
        }
        100% {
          @apply hidden;
        }
      }
    }
  `]
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

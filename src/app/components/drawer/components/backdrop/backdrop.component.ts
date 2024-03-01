import { Component, HostBinding, effect, inject } from '@angular/core';
import { BackdropService } from './backdrop.service';

@Component({
  selector: 'app-backdrop',
  standalone: true,
  imports: [],
  templateUrl: './backdrop.component.html',
  styleUrl: './backdrop.component.scss'
})
export class BackdropComponent {
  @HostBinding('attr.backdrop-visible')
  public backdropVisible: boolean = false;

  private readonly backdrop = inject(BackdropService);

  private backdropEffect = effect(() => {
    this.backdropVisible = this.backdrop.isVisible();
  })

}

import { DrawerService } from '@/core/components/drawer/drawer.service';
import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { DrawerStackService, cn } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-drawer-navbar',
  standalone: true,
  imports: [NgClass, AsyncPipe, TranslocoPipe],
  templateUrl: './drawer-navbar.component.html'
})
export class DrawerNavbarComponent {
  cn = cn;

  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly drawerService = inject(DrawerService);

  readonly isExtended = toSignal(this.drawerService.isExtended);
}

import { SelectionHistoryService } from '@/app/services/selection-history.service';
import { Component, ComponentRef, OnDestroy, ViewContainerRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { DrawerComponent } from '../drawer/drawer.component';
import { DrawerStackService } from './drawer-stack.service';

const DRAWER_STACK_MAX_COUNT = 3;

@Component({
  selector: 'app-drawer-stack',
  standalone: true,
  imports: [DrawerComponent],
  template: '',
  styleUrl: './drawer-stack.component.scss'
})
export class DrawerStackComponent implements OnDestroy {
  private readonly selectionHistory = inject(SelectionHistoryService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly drawerStackService = inject(DrawerStackService);

  private readonly selectionHistory$ = this.selectionHistory.selectionHistoryEvent;

  private readonly drawers: ComponentRef<DrawerComponent>[] = [];
  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.selectionHistory$.subscribe((event) => {
        if (event !== 'new') return;

        this.openTopDrawer(this.selectionHistory.getCurrentSelectionIndex());
      })
    );

    this.subscriptions.add(
      this.drawerStackService.toggleTopDrawerExtension$.subscribe(() => this.toggleTopDrawerExtension())
    );
    this.subscriptions.add(
      this.drawerStackService.closeTopDrawer$.subscribe(() => this.closeTopDrawer())
    );
    this.subscriptions.add(
      this.drawerStackService.closeAllDrawers$.subscribe(() => this.closeAllDrawers())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private openTopDrawer(index: number): void {
    if (this.drawers.length >= DRAWER_STACK_MAX_COUNT) {
      console.log('Drawer stack is full');
      this.shiftDrawer();
    }

    this.pushDrawer(index);
  }

  private closeTopDrawer(): void {
    const top = this.drawers.pop();

    this.selectionHistory.back();

    this.closeAndDestroyDrawer(top);

    if (this.drawers.length < DRAWER_STACK_MAX_COUNT && this.selectionHistory.getHistoryLength() > this.drawers.length)
      this.unshiftDrawer(this.selectionHistory.getHistoryLength() - this.drawers.length - 1);
  }

  private closeAllDrawers(): void {
    this.closeAndDestroyDrawer(this.drawers.pop());
    this.drawers.forEach((drawer) => drawer.destroy());
    this.drawers.length = 0;
  }

  private toggleTopDrawerExtension(): void {
    const top = this.drawers[this.drawers.length - 1];

    top?.instance.drawer.toggleExtension();
  }

  private pushDrawer(index: number): void {
    const drawer = this.viewContainer.createComponent(DrawerComponent);

    drawer.instance.selectionId = index;

    this.drawers.push(drawer);

    // setTimeout is needed to ensure that the drawer is fully initialized
    // and the animation will be played
    setTimeout(() => {
      drawer.instance.drawer.open();
    });
  }

  private shiftDrawer(): void {
    const drawer = this.drawers.shift();

    this.closeAndDestroyDrawer(drawer);
  }

  private unshiftDrawer(index: number): void {
    const drawer = this.viewContainer.createComponent(DrawerComponent);

    drawer.instance.selectionId = index;
    this.viewContainer.insert(drawer.hostView, 0);

    this.drawers.unshift(drawer);

    drawer.instance.drawer.open();
  }

  private closeAndDestroyDrawer(drawer?: ComponentRef<DrawerComponent>) {
    drawer?.instance.drawer.close();

    setTimeout(() => {
      drawer?.destroy();
    }, 250);
  }
}

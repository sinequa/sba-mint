import { AsyncPipe } from '@angular/common';
import { Component, ComponentRef, HostBinding, OnDestroy, ViewContainerRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { AppStore, DrawerStackService, SelectionHistoryService } from '@sinequa/atomic-angular';

import { DrawerPreviewComponent } from '../preview/preview.component';
import { DrawerComponent } from '../drawer.component';

const DRAWER_STACK_MAX_COUNT = 3;

@Component({
  selector: 'app-drawer-stack',
  standalone: true,
  imports: [AsyncPipe, DrawerComponent],
  template: ``,
  styles: [`
    :host {
      position: absolute;
      top: 50%;
      right: 0;

      --drawer-width: 46;
      --drawer-subdrawer-width: 400px;

      z-index: theme('zIndex.drawer');

      transition: right 300ms linear;

      &[drawer-opened="true"] {
        right: calc(1% * var(--drawer-width));
      }
    }
  `]
})
export class DrawerStackComponent implements OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  readonly drawerStackService = inject(DrawerStackService);
  protected readonly selectionHistory = inject(SelectionHistoryService);
  protected readonly viewContainer = inject(ViewContainerRef);

  protected readonly selectionHistory$ = this.selectionHistory.selectionHistoryEvent;

  protected readonly drawers: ComponentRef<DrawerComponent>[] = [];
  get drawersLength() { return this.drawers.length; }

  protected readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.drawerStackService.isOpened.subscribe((state) => this.drawerOpened = state)
    );

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
      this.drawerStackService.forceTopDrawerCollapse$.subscribe(() => this.collapseTopDrawer())
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

  private collapseTopDrawer(): void {
    const top = this.drawers[this.drawers.length - 1];

    top?.instance.drawer.collapse();
  }

  private toggleTopDrawerExtension(): void {
    const top = this.drawers[this.drawers.length - 1];

    top?.instance.drawer.toggleExtension();
  }

  private pushDrawer(index: number): void {
    const drawer = this.viewContainer.createComponent(DrawerPreviewComponent);

    drawer.setInput('articleId', this.selectionHistory.getSelection(index)?.id);

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
    const drawer = this.viewContainer.createComponent(DrawerPreviewComponent);

    drawer.setInput('articleId', this.selectionHistory.getSelection(index)?.id);

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

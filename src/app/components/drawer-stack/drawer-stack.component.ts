import { SelectionHistoryService } from '@/app/services/selection-history.service';
import { Component, ComponentRef, OnDestroy, ViewContainerRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { DrawerAssistantComponent } from '../drawer/components/assistant/assistant.component';
import { DrawerPreviewComponent } from '../drawer/components/preview/preview.component';
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
      this.drawerStackService.forceTopDrawerCollapse$.subscribe(() => this.collapseTopDrawer())
    );
    this.subscriptions.add(
      this.drawerStackService.closeTopDrawer$.subscribe(() => this.closeTopDrawer())
    );
    this.subscriptions.add(
      this.drawerStackService.closeAllDrawers$.subscribe(() => this.closeAllDrawers())
    );
    this.subscriptions.add(
      this.drawerStackService.openChatDrawer$.subscribe(() => this.openChatDrawer())
    );
    this.subscriptions.add(
      this.drawerStackService.closeChatDrawer$.subscribe(() => this.closeChatDrawer())
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
    const drawer = this.viewContainer.createComponent(DrawerPreviewComponent);

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

  private openChatDrawer(): void {
    console.log('Open chat drawer');

    const drawer = this.viewContainer.createComponent(DrawerAssistantComponent);

    this.drawers.push(drawer);

    setTimeout(() => {
      drawer.instance.drawer.open();
    });
  }

  private closeChatDrawer(): void {
    console.log('Close chat drawer');

    const drawer = this.drawers[this.drawers.length - 1];

    if (drawer && drawer.instance instanceof DrawerAssistantComponent) {
      drawer.instance.drawer.close();

      setTimeout(() => {
        drawer.destroy();
      }, 250);

      this.drawers.pop();
    }
  }
}

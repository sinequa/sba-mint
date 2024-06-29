import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { SelectionHistoryService } from '@sinequa/atomic-angular';
import { DrawerService } from './drawer.service';

/**
 * Each Drawer component has it's own drawer service to handle its state and link it to the drawer stack.
 */

@Component({
  selector: 'app-drawer',
  standalone: true,
  providers: [DrawerService],
  template: ``,
  styleUrl: './drawer.component.scss'
})
export class DrawerComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  @HostBinding('attr.drawer-extended')
  public drawerExtended: boolean = false;

  @HostBinding('style.grid-template-columns')
  public drawerGridTemplateColumns: string = '';

  @HostListener('mousemove', ['$event'])
  public mouseMove(event: MouseEvent): void {
    if (!this.isSliding) return;

    const min = window.innerWidth * 3 / 100;
    const max = window.innerWidth * 46 / 100;
    const width = Math.min(Math.max(event.clientX, min), max);

    this.drawerGridTemplateColumns = `${width}px minmax(min-content, 1fr) var(--drawer-subdrawer-width)`;
  }

  @HostListener('mousedown', ['$event'])
  public mouseDown(event: MouseEvent): void {
    if (event.target !== this.drawerHandle?.nativeElement) return;

    this.disableAnimation();
    this.isSliding = true;
  }

  @HostListener('mouseup')
  public mouseUp(): void {
    if (this.isSliding) this.enableAnimation();

    this.isSliding = false;
  }

  @ViewChild('drawerHandle', { static: true })
  public drawerHandle: ElementRef | undefined;


  public readonly drawer = inject(DrawerService);

  protected readonly element = inject(ElementRef);
  protected readonly selectionHistory = inject(SelectionHistoryService);

  private isSliding = false;
  private defaultDrawerGridTemplate = '';

  private readonly sub = new Subscription();

  constructor() {
    this.sub.add(
      this.drawer.isOpened.subscribe(state => {
        this.drawerOpened = state;
        if (!state) this.resetGridTemplateColumns();
      })
    );

    this.sub.add(
      this.drawer.isExtended.subscribe(state => {
        this.drawerExtended = state;
        if (!state) this.resetGridTemplateColumns();
      })
    );
  }

  ngOnInit(): void {
    this.defaultDrawerGridTemplate = this.element.nativeElement.style.gridTemplateColumns;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private disableAnimation(): void {
    this.element.nativeElement.classList.add('no-transition-important');
  }

  private enableAnimation(): void {
    this.element.nativeElement.classList.remove('no-transition-important');
  }

  private resetGridTemplateColumns(): void {
    this.element.nativeElement.style.gridTemplateColumns = this.defaultDrawerGridTemplate;
  }
}

import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, input, signal } from '@angular/core';
import { Placement, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

@Component({
  selector: 'sq-dropdown',
  standalone: true,
  imports: [NgClass],
  template: `
<div #trigger class="select-none dropdown" (click)="toggle()">
    <ng-content></ng-content>
</div>
<div #dropdownWrapper
  class="absolute text-sm min-w-fit"
  [style.display]="isOpen() ? 'block' : 'none'"
  [style.width]="width + 'px'"
  >
  <ng-content select="[dropdown-content]"></ng-content>
</div>
  `
})
export class DropdownComponent implements AfterViewInit{
  isOpen = signal(false);
  position = input<Placement>('bottom-start');
  disabled = input<boolean>();

  @ViewChild('dropdownWrapper') dropdown!: ElementRef;
  @ViewChild('trigger') trigger!: ElementRef;
  x = 0;
  y = 0;
  width = 0;

  constructor(private el: ElementRef) {}

  toggle() {
    if(this.disabled()) return;
    this.isOpen.update(() => !this.isOpen());
    this.calculatePosition();
  }

  calculatePosition() {
    computePosition(this.trigger.nativeElement, this.dropdown.nativeElement, {
      placement: this.position(),
      middleware: [offset(8), flip(), shift()],
    }).then(({ x, y }: { x: number; y: number }) => {
      this.dropdown.nativeElement.style.left = x + 'px';
      this.dropdown.nativeElement.style.top = y + 'px';
      this.width = this.trigger.nativeElement.offsetWidth;
    });
  }

  ngAfterViewInit() {
    autoUpdate(this.trigger.nativeElement, this.dropdown.nativeElement, () => {
      if (!this.isOpen) return;
      this.calculatePosition();
    });
  }

  // Onclick outside the dropdown, close it
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (
      // Check if the click was outside the dropdown
      // and the dropdown is open
      // and the click was not on the button
      // then close the dropdown
      !this.dropdown.nativeElement.contains(event.target)
      && this.isOpen
      && !this.trigger.nativeElement.contains(event.target)
    ) {
      this.isOpen.set(false);
    }
  }
}

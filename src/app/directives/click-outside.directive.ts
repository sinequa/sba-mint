import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Output,
  } from '@angular/core';

  @Directive({
    selector: '[clickAway]',
    standalone: true,
  })
  export class clickOutsideyDirective {
    @Output()
    clickAway: EventEmitter<void> = new EventEmitter();

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: PointerEvent) {
      const nativeElement: HTMLElement = this.elementRef.nativeElement;
      const clickedInside: boolean = nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.clickAway.emit();
      }
    }

    constructor(private elementRef: ElementRef) {}
  }

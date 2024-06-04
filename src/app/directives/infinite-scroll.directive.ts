import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[infinity-scroll]',
  standalone: true
})
export class InfinityScrollDirective implements AfterViewInit, OnDestroy {
  @Input() options = { root: null };
  @Output() loadMore = new EventEmitter<void>();

  private observer= new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      this.loadMore.emit();
    }
  }, this.options);

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

}
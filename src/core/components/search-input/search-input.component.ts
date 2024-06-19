import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnDestroy, Output, booleanAttribute, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { getState } from '@ngrx/signals';
import { Subscription, debounceTime, filter } from 'rxjs';

import { AutocompleteService } from '@sinequa/atomic-angular';
import { AppStore, QueryParamsStore } from '@sinequa/atomic-angular';

const DEBOUNCE_DELAY = 300;

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [NgClass, FormsModule, OverlayModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent implements OnDestroy {

  @Output() public readonly debounced = new EventEmitter<string>();
  @Output() public readonly validated = new EventEmitter<string>();
  @Output() public readonly saved = new EventEmitter<void>();
  @Output() public readonly clicked = new EventEmitter<void>();

  public readonly showSave = input(false, { transform: booleanAttribute });

  public readonly input = signal<string>('');

  protected saveAnimation = signal<boolean>(false);
  protected oldInput: string = this.input();

  protected readonly autocompleteService = inject(AutocompleteService);
  private readonly customization = inject(AppStore).customizationJson;
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly allowChatDrawer = computed(() => false );
  protected readonly overlayOpen = this.autocompleteService.opened;

  private readonly _subscription = new Subscription();

  constructor(public readonly el: ElementRef) {

    effect(() => {
      const { text } = getState(this.queryParamsStore);
      this.setInput(text);
    }, { allowSignalWrites: true })


    this._subscription.add(
      toObservable(this.input)
        .pipe(
          filter(text => text !== undefined),
          debounceTime(DEBOUNCE_DELAY)
        )
        .subscribe(text => this.debounced.emit(text))
    )
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  public inputClicked(): void {
    this.overlayOpen.set(true);
    this.clicked.emit();
  }

  public setInput(text: string | undefined, silent: boolean = true): void {
    if (text === undefined) return;

    this.input.set(text);
    this.oldInput = text;

    if (!silent) this.emitText();
  }

  protected emitText(): void {
    if (this.input() === this.oldInput) return;

    this.oldInput = this.input();
    this.overlayOpen.set(false);
    this.validated.emit(this.input());
  }

  protected clearInput(): void {
    this.oldInput = '';

    this.input.set('');

    this.validated.emit('');
  }

  protected saveQuery(): void {
    this.saveAnimation.set(true);
    setTimeout(() => this.saveAnimation.set(false), 1000);

    this.saved.emit();
  }
}

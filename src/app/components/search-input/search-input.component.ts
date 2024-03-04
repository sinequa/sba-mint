import { Component, EventEmitter, OnDestroy, Output, booleanAttribute, effect, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription, debounceTime, filter } from 'rxjs';

const DEBOUNCE_DELAY = 300;

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent implements OnDestroy {
  @Output() public readonly updated = new EventEmitter<string>();
  @Output() public readonly debounced = new EventEmitter<string>();
  @Output() public readonly validated = new EventEmitter<string>();

  public readonly showSave = input(false, { transform: booleanAttribute });

  public readonly input = signal<string | undefined>(undefined);

  private readonly _subscription = new Subscription();

  constructor() {
    effect(() => {
      if (this.input() !== undefined)
        this.updated.emit(this.input());
    });

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

  public setInput(text: string | undefined, silent: boolean = true): void {
    if (text === undefined) return;

    this.input.set(text);

    if (!silent) this.emitText();
  }

  protected emitText(): void {
    this.validated.emit(this.input());
  }

  protected clearInput(): void {
    this.input.set('');
    this.emitText();
  }

  protected saveQuery(): void {
    console.log('save query');
  }
}

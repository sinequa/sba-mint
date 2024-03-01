import { Subject, defer, merge, of, shareReplay } from 'rxjs';

export class Store<T> {
  private _state: T | undefined = undefined;

  public get state(): T | undefined { return this._state }
  protected set state(value: T) { this._state = value }

  private readonly _updated = new Subject<T | undefined>();

  public readonly next$ = this._updated.asObservable();
  public readonly current$ = merge(this.next$, defer(() => of(this._state))).pipe(shareReplay(1));

  constructor(initialValue?: T) {
    if (initialValue) this.state = initialValue;
  }

  public set(state: T): void {
    this._state = state;
    this._updated.next(state);
  }

  public clear(): void {
    this._state = undefined;
    this._updated.next(undefined);
  }
}

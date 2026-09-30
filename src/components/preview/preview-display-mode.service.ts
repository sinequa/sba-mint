import { Injectable, signal } from "@angular/core";

/**
 * Coordinates the "expand" fallback between `PreviewNavbarComponent` and `SheetPreviewerComponent`
 * on tablet widths: `sheet-previewer` already has a sheet open showing the full `<preview>`, so
 * clicking "expand" there must swap its content for the simplified view in place — never stack a
 * second sheet/dialog on top. `providedIn: 'root'` so both components share the exact same instance
 * regardless of where each is provided/instantiated.
 */
@Injectable({ providedIn: "root" })
export class PreviewDisplayModeService {
  private readonly _forcedSimple = signal(false);
  readonly forcedSimple = this._forcedSimple.asReadonly();

  enableSimple(): void {
    this._forcedSimple.set(true);
  }

  reset(): void {
    this._forcedSimple.set(false);
  }
}

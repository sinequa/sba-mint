import { Injectable, signal, TemplateRef } from "@angular/core";

/**
 * Lets a route component project page-specific content into the global fixed mobile header
 * (`app.component.html`, `<768px only`), which has no other extension point of its own.
 * `providedIn: 'root'` so every page shares the same slot regardless of where it's set from.
 */
@Injectable({ providedIn: "root" })
export class HeaderExtrasService {
  private readonly _template = signal<TemplateRef<unknown> | null>(null);
  readonly template = this._template.asReadonly();

  set(template: TemplateRef<unknown>): void {
    this._template.set(template);
  }

  /** No-ops if `template` no longer owns the slot — avoids a losing race where a leaving page's
   * cleanup runs after the next page already set its own template. */
  clear(template: TemplateRef<unknown>): void {
    if (this._template() === template) this._template.set(null);
  }
}

import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, inject } from "@angular/core";
import { TranslocoService } from "@jsverse/transloco";
import { sysLang } from "@sinequa/atomic";
import { Subscription } from "rxjs";

/**
 * The `SyslangPipe` class is a custom pipe that transforms a string value using the current language.
 * This pipe is used to translate strings that are not part of the Angular i18n system.
 * This pipe exists to keep the compatibility with a legacy system that uses a custom language syntax.
 *
 * This pipe can be used in the following way:
 *
 * @example
 * <div>{{ 'Hello[fr]Bonjour' | syslang }}</div>
 * // output: `Bonjour` if your current language is 'fr'
 * // output: `Hello` if your current language is not 'fr'
 *
 * <div>{{ 'Hello[fr]Bonjour' | syslang: 'fr' }}</div>
 * // output: `Bonjour` even if your current language is not 'fr'
 */
@Pipe({
  name: 'syslang',
  standalone: true,
  pure: false
})
export class SyslangPipe implements PipeTransform, OnDestroy {
  private readonly transloco = inject(TranslocoService);
  private readonly cdr = inject(ChangeDetectorRef);

  private lastValue: string | null = null;
  private currentLang: string;
  private subscription: Subscription | null = null;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  constructor() {
    this.currentLang = this.transloco.getActiveLang();
    this.subscription = this.transloco.langChanges$.subscribe(locale => this.currentLang = locale);
  }

  /**
   * Transforms the input value using the current language.
   * @param value The input string value to be transformed.
   * @returns The transformed string value.
   */
  transform(value?: string, lang?: string): string | null {

    const transformedValue = sysLang(value || "", lang || this.currentLang);

    if (transformedValue !== this.lastValue) {
      this.lastValue = transformedValue;
      this.cdr.markForCheck();
    }

    return this.lastValue;
  }
}
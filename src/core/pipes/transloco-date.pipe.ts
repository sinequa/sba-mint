import { DATE_PIPE_DEFAULT_OPTIONS, DATE_PIPE_DEFAULT_TIMEZONE, DatePipe, DatePipeConfig } from '@angular/common';
import { ChangeDetectorRef, Inject, inject, LOCALE_ID, OnDestroy, Optional, Pipe } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translocoDate',
  pure: false,
  standalone: true
})
export class TranslocoDateImpurePipe extends DatePipe implements OnDestroy {
  private readonly transloco = inject(TranslocoService);
  private readonly cdr = inject(ChangeDetectorRef);

  private lastTransformedValue: string | null = null;
  private subscription: Subscription | null = null;

  constructor(
    @Inject(LOCALE_ID) locale: string,
    @Inject(DATE_PIPE_DEFAULT_TIMEZONE) @Optional() defaultTimezone?: string | null,
    @Inject(DATE_PIPE_DEFAULT_OPTIONS) @Optional() defaultOptions?: DatePipeConfig | null,
  ) {
    super(locale, defaultTimezone, defaultOptions);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  override transform(value: Date | string | number, format?: string, timezone?: string): string | null;
  override transform(value: null | undefined, format?: string, timezone?: string): null;
  override transform(value: Date | string | number | null | undefined, format?: string, timezone?: string): string | null {
    this.subscription?.unsubscribe();

    this.subscription = this.transloco.langChanges$.subscribe((locale) => {
      const transformedValue = super.transform(value, format, timezone, locale);

      if (transformedValue !== this.lastTransformedValue) {
        this.lastTransformedValue = transformedValue;
        this.cdr.markForCheck();
      }
    });

    return this.lastTransformedValue;
  }
}

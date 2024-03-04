import { APP_INITIALIZER, Provider, Type } from "@angular/core";

export function emptyPromiseFactory() {
  return () => Promise.resolve();
}

/**
 * Create a provider array for a service class to be eagerly provided
 * @param klass service class to be eagerly provided
 * @returns provider array
 */
export function eagerProvider(klass: Type<unknown>): Provider[] {
  return [
    klass,
    {
      provide: APP_INITIALIZER,
      useFactory: emptyPromiseFactory,
      deps: [klass],
      multi: true
    }
  ]
}
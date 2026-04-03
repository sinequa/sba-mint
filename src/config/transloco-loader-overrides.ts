import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { deepmerge } from "../utils/deepmerge";

const OVERRIDDEN_SCOPES: string[] = []; // Scopes for which you want to apply overrides

@Injectable({ providedIn: "root" })
export class TranslocoHttpLoaderOverrides implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(langue: string, data?: { scope: string }) {
    const lang = langue.split("/").pop();
    const scope = data?.scope;

    // 1. Path to the original translation in the library
    // (Adjust according to your scopes configuration)
    if (!scope || !OVERRIDDEN_SCOPES.includes(scope)) {
      const url = scope ? `/assets/i18n/${scope}/${lang}.json` : `assets/i18n/${lang}.json`;
      return this.http.get<Translation>(url).pipe(
        catchError(() => {
          // to avoid infinite resources fetching
          return of({});
        })
      );
    }

    //1. Path to the original translation in the library
    const libraryUrl = `/assets/i18n/${scope}/${lang}.json`;
    // 2. Path to your local override
    const overrideUrl = `/assets/i18n/overrides/${scope}/${lang}.json`;

    return forkJoin([
      this.http.get<Translation>(libraryUrl).pipe(catchError(() => of({}))),
      this.http.get<Translation>(overrideUrl).pipe(catchError(() => of({})))
    ]).pipe(map(([base, override]) => deepmerge(base, override)));
  }
}


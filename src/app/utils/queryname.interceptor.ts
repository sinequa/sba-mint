import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Query, Result } from '@sinequa/atomic';
import { map } from 'rxjs';
import { Article } from '../types';

// TODO: Replace with your locale name
// const LOCALE_NAME = "fr";

/**
 * Interceptor function to add the query name to records of the results.
 * These query names are used if a records gets bookmarked (it is needed to open the bookmark drawer).
 *
 * @param request - The HTTP request to be intercepted.
 * @param next - The next HTTP handler in the chain.
 * @returns An Observable of the HTTP response.
 */
export const queryNameInterceptorFn: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {

  return next(request).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        if (request.url.includes("query")) {
          const queryName = ((request.body as {query: Query})['query'] as Query).name;

           (event.body as Result)?.records?.forEach((r: Article) => {
             r['$queryName'] = queryName || undefined;
           });
        }
      }
      return event;
    })
  );
}
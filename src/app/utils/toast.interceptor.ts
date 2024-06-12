import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor function for handling HTTP errors.
 * @param request - The HTTP request.
 * @param next - The HTTP handler.
 * @returns An Observable of the HTTP response.
 */
export const toastInterceptorFn: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    if(request.url.includes('api/v1/audit.notify')) {
        return next(request);
    }

    return next(request).pipe(catchError((err) => {
        const { status, statusText, error } = err;
        if ([401, 403, 500, 503].includes(status)) {
            const { errorMessage = err.statusText, errorCodeText } = error;
            console.log("toast interceptor", err);
            toast.error(statusText, { description: `${errorCodeText}: ${errorMessage}`, closeButton: true, duration: 5000 });
        }

        return Promise.reject(err);
    }))
};
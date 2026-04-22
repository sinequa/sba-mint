import type { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export interface OnRouteAttached {
  onRouteAttached(): void;
}

export class CustomReuseStrategy implements RouteReuseStrategy {
  // A storage object to hold our "frozen" component instances
  private handlers: { [key: string]: DetachedRouteHandle } = {};

  // 1. Should we "freeze" this component when leaving?
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // We only want to save the 'assistant' route
    return !!route.data['reuse'];
  }

  // 2. Save the component into our storage
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (route.routeConfig?.path) {
      this.handlers[route.routeConfig.path] = handle;
    }
  }

  // 3. Should we try to re-attach a saved component?
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig?.path && !!this.handlers[route.routeConfig.path];
  }

  // 4. Retrieve the saved component from storage
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig?.path) return null;
    const handle = this.handlers[route.routeConfig.path];
    if (handle) {
      const componentRef = (handle as any).componentRef;
      if (componentRef?.instance && 'onRouteAttached' in componentRef.instance) {
        Promise.resolve().then(() => (componentRef.instance as OnRouteAttached).onRouteAttached());
      }
    }
    return handle ?? null;
  }

  // 5. Should we reuse the route? (Standard logic)
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}

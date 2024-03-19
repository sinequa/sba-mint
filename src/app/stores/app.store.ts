import { CCApp, CCWebService } from '@sinequa/atomic';

import { Store } from './store';

export class AppStore extends Store<CCApp> {
  /**
   * Returns the web service by type name
   * @param type Web service type name
   * @returns A {@link CCWebService} object or undefined if not found
   */
  getWebServiceByType(type: CCWebService['webServiceType']): CCWebService | undefined {
    if (!this.state?.webServices) return undefined;

    let webService = undefined;

    Object.keys(this.state.webServices)
      .forEach((key) => {
        const ws = this.state!.webServices[key];
        if (ws.webServiceType === type) webService = ws;
      });

    return webService;
  }
}

export const appStore = new AppStore();

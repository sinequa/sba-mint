import { Environment } from "./env.model";

/**
 * Environment for the **production** SPFx build (angular config `spfx-production`).
 *
 * `production: true` disables the mocked fallback guard in `main.spfx.ts`: without a host context
 * (`window.__MINT_SPFX_CONTEXT__`), the app errors out (500 page) instead of fabricating a DEV context.
 *
 * `app` and `backendUrl` are NOT defined here: in SPFx they come from the web part property pane
 * (see spfx-host/MintWebPart.ts) and are applied via `setGlobalConfig` at bootstrap.
 */
export const environment: Environment = {
  production: true
};

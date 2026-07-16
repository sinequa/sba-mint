import { Version } from "@microsoft/sp-core-library";
import { AadHttpClient, type AadTokenProvider } from "@microsoft/sp-http";
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import { loadMintAssets } from "./load-mint-assets";

/**
 * Contract injected into `window.__MINT_SPFX_CONTEXT__`, consumed by `src/main.spfx.ts` of the mint bundle.
 * MUST stay aligned with `MintSpfxContext` (mint-internal/src/config/spfx-context.ts).
 */
interface MintSpfxContext {
  aadHttpClient: AadHttpClient;
  aadTokenProvider: AadTokenProvider;
  resourceUri: string;
  backendUrl?: string;
  app?: string;
}

export interface IMintWebPartProps {
  /** AAD App ID / resource URI of the Sinequa API (e.g. "api://sinequa-search/.default" or the client id). */
  resourceUri: string;
  /** Sinequa server URL (e.g. "https://sinequa.contoso.com"). REQUIRED — see README. */
  backendUrl: string;
  /** Sinequa application name. */
  app: string;
  /** Public base URL where the contents of `dist/sinequa-mint` are hosted (CDN or SP library). */
  assetsBaseUrl: string;
}

/**
 * "Glue" web part: it contains no UI. It
 *  1. gets the `AadHttpClient` + `AadTokenProvider` from the SPFx context,
 *  2. publishes them (with backendUrl/app/resourceUri) on `window.__MINT_SPFX_CONTEXT__`,
 *  3. loads the mint Angular bundle (`spfx` build), which self-bootstraps on `<app-root>`.
 *
 * ⚠️ One Angular instance per page: do not place this web part multiple times on the same page.
 */
export default class MintWebPart extends BaseClientSideWebPart<IMintWebPartProps> {
  public async render(): Promise<void> {
    // Host element expected by the Angular bootstrap (AppComponent selector = "app-root").
    this.domElement.innerHTML = `<app-root></app-root>`;

    const [aadHttpClient, aadTokenProvider] = await Promise.all([
      this.context.aadHttpClientFactory.getClient(this.properties.resourceUri),
      this.context.aadTokenProviderFactory.getTokenProvider(),
    ]);

    const ctx: MintSpfxContext = {
      aadHttpClient,
      aadTokenProvider,
      resourceUri: this.properties.resourceUri,
      backendUrl: this.properties.backendUrl,
      app: this.properties.app,
    };
    (window as unknown as { __MINT_SPFX_CONTEXT__?: MintSpfxContext }).__MINT_SPFX_CONTEXT__ = ctx;

    // Load the bundle's styles + scripts (idempotent). Lazy chunks then resolve
    // relative to main.js → assetsBaseUrl must point to where dist/sinequa-mint is hosted.
    await loadMintAssets(this.properties.assetsBaseUrl);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Sinequa Mint configuration" },
          groups: [
            {
              groupName: "Sinequa",
              groupFields: [
                PropertyPaneTextField("backendUrl", { label: "Sinequa server URL" }),
                PropertyPaneTextField("app", { label: "Sinequa application" }),
                PropertyPaneTextField("resourceUri", { label: "AAD resource URI / App ID" }),
                PropertyPaneTextField("assetsBaseUrl", { label: "Mint assets base URL" }),
              ],
            },
          ],
        },
      ],
    };
  }
}

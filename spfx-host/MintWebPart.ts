import { Version } from "@microsoft/sp-core-library";
import { AadHttpClient, type AadTokenProvider } from "@microsoft/sp-http";
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import { loadMintAssets } from "./load-mint-assets";

/**
 * Contrat injecté dans `window.__MINT_SPFX_CONTEXT__`, consommé par `src/main.spfx.ts` du bundle mint.
 * DOIT rester aligné avec `MintSpfxContext` (mint-internal/src/config/spfx-context.ts).
 */
interface MintSpfxContext {
  aadHttpClient: AadHttpClient;
  aadTokenProvider: AadTokenProvider;
  resourceUri: string;
  backendUrl?: string;
  app?: string;
}

export interface IMintWebPartProps {
  /** AAD App ID / resource URI de l'API Sinequa (ex. "api://sinequa-search/.default" ou le client id). */
  resourceUri: string;
  /** URL du serveur Sinequa (ex. "https://sinequa.contoso.com"). OBLIGATOIRE — cf. README. */
  backendUrl: string;
  /** Nom de l'application Sinequa. */
  app: string;
  /** URL de base publique où est hébergé le contenu de `dist/sinequa-mint` (CDN ou bibliothèque SP). */
  assetsBaseUrl: string;
}

/**
 * Web part « glue » : il ne contient pas l'UI. Il
 *  1. récupère l'`AadHttpClient` + l'`AadTokenProvider` du contexte SPFx,
 *  2. les publie (avec backendUrl/app/resourceUri) dans `window.__MINT_SPFX_CONTEXT__`,
 *  3. charge le bundle Angular mint (build `spfx`), qui s'auto-bootstrappe sur `<app-root>`.
 *
 * ⚠️ Une seule instance Angular par page : ne pas placer ce web part plusieurs fois sur la même page.
 */
export default class MintWebPart extends BaseClientSideWebPart<IMintWebPartProps> {
  public async render(): Promise<void> {
    // Élément hôte attendu par le bootstrap Angular (selector AppComponent = "app-root").
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

    // Charge styles + scripts du bundle (idempotent). Les chunks lazy se résolvent ensuite
    // relativement à main.js → assetsBaseUrl doit pointer là où dist/sinequa-mint est hébergé.
    await loadMintAssets(this.properties.assetsBaseUrl);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Configuration Sinequa Mint" },
          groups: [
            {
              groupName: "Sinequa",
              groupFields: [
                PropertyPaneTextField("backendUrl", { label: "URL du serveur Sinequa" }),
                PropertyPaneTextField("app", { label: "Application Sinequa" }),
                PropertyPaneTextField("resourceUri", { label: "AAD resource URI / App ID" }),
                PropertyPaneTextField("assetsBaseUrl", { label: "URL de base des assets mint" }),
              ],
            },
          ],
        },
      ],
    };
  }
}

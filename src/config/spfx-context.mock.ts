import type { MintSpfxContext } from "./spfx-context";

/**
 * Contexte SPFx **mocké, DEV uniquement** — permet de faire tourner le build `spfx` sous `ng serve`
 * (sans web part hôte SharePoint) contre le mock backend du Sinequa Auth Playground.
 * N'est JAMAIS utilisé en production : cf. le garde `environment.production` dans `main.spfx.ts`.
 *
 * - `aadTokenProvider.getToken()` récupère un jeton Azure AD depuis le faux endpoint AAD du playground
 *   (`/__mock/aad-token`, proxifié vers le playground — cf. proxy.conf.json), comme le ferait le vrai
 *   `AadTokenProvider` SPFx contre login.microsoftonline.com.
 * - `aadHttpClient` route les appels web-api de `@sinequa/atomic` (build spfx) en y attachant ce jeton
 *   en `Authorization: Bearer`.
 */

/** AAD App ID / resource URI ciblé (identique au scénario `spfx` du playground). */
const RESOURCE_URI = "api://sinequa-search/.default";

type SendOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  signal?: AbortSignal | null;
};

/** Mock `AadTokenProvider` : mint (et met en cache) un jeton via le faux endpoint AAD du playground. */
function makeTokenProvider() {
  let cached: Promise<string> | null = null;
  const fetchToken = async (): Promise<string> => {
    const res = await fetch(`/__mock/aad-token?resource=${encodeURIComponent(RESOURCE_URI)}`);
    const { access_token } = (await res.json()) as { access_token: string };
    return access_token;
  };
  return {
    getToken(_resourceEndpoint: string): Promise<string> {
      cached ??= fetchToken();
      return cached;
    },
  };
}

/**
 * Mock `AadHttpClient`. La lib appelle `client.get/post(url, configurations.v1, …)` (et `client.fetch`
 * pour PUT/PATCH/DELETE) et lit `client.constructor.configurations.v1`, d'où le static `configurations`.
 */
function makeAadHttpClient(getToken: () => Promise<string>) {
  class MockAadHttpClient {
    static readonly configurations = { v1: { __mock: "v1" } };

    get(url: string, _config: unknown, options?: SendOptions): Promise<Response> {
      return this.send("GET", url, options);
    }
    post(url: string, _config: unknown, options?: SendOptions): Promise<Response> {
      return this.send("POST", url, options);
    }
    fetch(url: string, _config: unknown, options?: SendOptions): Promise<Response> {
      return this.send(options?.method ?? "GET", url, options);
    }

    private async send(method: string, url: string, options?: SendOptions): Promise<Response> {
      const token = await getToken();
      const headers = new Headers(options?.headers);
      headers.set("Authorization", `Bearer ${token}`);
      return fetch(url, {
        method,
        headers,
        body: options?.body ?? undefined,
        credentials: "include",
        signal: options?.signal ?? undefined,
      });
    }
  }
  return new MockAadHttpClient();
}

/** Construit un `MintSpfxContext` mocké pointant vers le playground. */
export function createMockSpfxContext(): MintSpfxContext {
  const provider = makeTokenProvider();
  return {
    aadTokenProvider: provider as unknown as MintSpfxContext["aadTokenProvider"],
    aadHttpClient: makeAadHttpClient(() =>
      provider.getToken(RESOURCE_URI),
    ) as unknown as MintSpfxContext["aadHttpClient"],
    resourceUri: RESOURCE_URI,
  };
}

import type { MintSpfxContext } from "./spfx-context";

/**
 * **Mocked, DEV-only** SPFx context — lets the `spfx` build run under `ng serve`
 * (without a SharePoint host web part) against the Sinequa Auth Playground mock backend.
 * NEVER used in production: see the `environment.production` guard in `main.spfx.ts`.
 *
 * - `aadTokenProvider.getToken()` fetches an Azure AD token from the playground's fake AAD endpoint
 *   (`/__mock/aad-token`, proxied to the playground — see proxy.conf.json), as the real SPFx
 *   `AadTokenProvider` would do against login.microsoftonline.com.
 * - `aadHttpClient` routes the `@sinequa/atomic` web-api calls (spfx build), attaching that token
 *   as `Authorization: Bearer`.
 */

/** Targeted AAD App ID / resource URI (same as the playground's `spfx` scenario). */
const RESOURCE_URI = "api://sinequa-search/.default";

type SendOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  signal?: AbortSignal | null;
};

/** Mock `AadTokenProvider`: mints (and caches) a token via the playground's fake AAD endpoint. */
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
 * Mock `AadHttpClient`. The lib calls `client.get/post(url, configurations.v1, …)` (and `client.fetch`
 * for PUT/PATCH/DELETE) and reads `client.constructor.configurations.v1`, hence the static `configurations`.
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

/** Builds a mocked `MintSpfxContext` pointing at the playground. */
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

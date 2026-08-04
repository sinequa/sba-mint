/**
 * Loads the mint `spfx` build assets (contents of `dist/sinequa-mint`) EXACTLY ONCE.
 *
 * `baseUrl` = public URL where that content is hosted (CDN / SharePoint library). Angular's lazy
 * chunks resolve relative to `main.js`, so as long as `main.js` is loaded from `baseUrl`, the chunks
 * follow automatically — no need to list them here.
 */
let loaded = false;

export async function loadMintAssets(baseUrl: string): Promise<void> {
  if (loaded) return; // one Angular app per page
  loaded = true;

  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  // Bundle global styles.
  injectLink(`${base}styles.css`);
  // If mint depends on Font Awesome (see index.html), host `assets/` too and uncomment:
  // injectLink(`${base}assets/vendors/fontawesome-pro-6.5.1-web/css/all.css`);

  // ESM scripts: polyfills then main. `main.js` self-bootstraps the app on <app-root>.
  await injectModule(`${base}polyfills.js`);
  await injectModule(`${base}main.js`);
}

function injectLink(href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function injectModule(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Échec de chargement de ${src}`));
    document.head.appendChild(script);
  });
}

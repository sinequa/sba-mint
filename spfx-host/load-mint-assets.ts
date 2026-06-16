/**
 * Charge UNE SEULE FOIS les assets du build `spfx` de mint (contenu de `dist/sinequa-mint`).
 *
 * `baseUrl` = URL publique où ce contenu est hébergé (CDN / bibliothèque SharePoint). Les chunks
 * lazy d'Angular se résolvent relativement à `main.js`, donc tant que `main.js` est chargé depuis
 * `baseUrl`, les chunks suivent automatiquement — pas besoin de les lister ici.
 */
let loaded = false;

export async function loadMintAssets(baseUrl: string): Promise<void> {
  if (loaded) return; // une seule app Angular par page
  loaded = true;

  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  // Styles globaux du bundle.
  injectLink(`${base}styles.css`);
  // Si mint dépend de Font Awesome (cf. index.html), héberge aussi `assets/` et décommente :
  // injectLink(`${base}assets/vendors/fontawesome-pro-6.5.1-web/css/all.css`);

  // Scripts ESM : polyfills puis main. `main.js` auto-bootstrappe l'app sur <app-root>.
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

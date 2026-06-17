# Hôte SPFx pour Sinequa Mint

Glue permettant d'exécuter l'application Angular **mint** (build `spfx`) à l'intérieur d'un web part
SharePoint Framework, avec authentification **Azure AD** via `AadHttpClient` / `AadTokenProvider`.

> Ces fichiers sont un **template** pour une solution SPFx **séparée** (générée par le Yeoman SharePoint
> generator). Ils ne sont **pas** compilés par le build Angular de mint (ils sont hors de `src/` et
> importent les paquets `@microsoft/sp-*`).

## Modes d'exécution : DEV (mock) vs PROD

Point fondamental : les vrais `AadHttpClient` / `AadTokenProvider` **n'existent que dans une page
SharePoint réelle** (ils viennent de `this.context.aadHttpClientFactory` dans le web part). Sans hôte
SPFx, impossible de minter un vrai token AAD. Donc « pointer vers la PROD » n'est **pas** « `ng serve`
contre un backend prod » : c'est un **changement de mode d'exécution** (déployer le web part), pas juste
une URL à changer.

En **DEV**, `src/main.spfx.ts` détecte l'absence de contexte hôte (`!__MINT_SPFX_CONTEXT__`) et, hors
production, **fabrique** un contexte mocké (`src/config/spfx-context.mock.ts`) qui tape le playground
d'auth Sinequa.

| Aspect | DEV (mock) | PROD (SharePoint réel) |
|---|---|---|
| Contexte AAD | `createMockSpfxContext()` → playground | `MintWebPart.render()` → vrai `window.__MINT_SPFX_CONTEXT__` |
| Token | faux endpoint `/__mock/aad-token` | `login.microsoftonline.com` via le contexte SPFx |
| `proxy.conf.json` | proxy → `http://localhost:5173` (route `/__mock`) | **inutile** (pas de `ng serve` ; appels cross-origin réels) |
| Backend | mock playground | `backendUrl` réel (property pane du web part) |
| `@sinequa/atomic` | `file:../atomic` (symlink local) | paquet publié sur le registre (cf. *Packaging — production*) |
| `environment.production` | `false` (garde mock actif) | `true` (sans contexte → page 500, **pas** de mock) |

⚠️ Pour un build PROD, s'assurer que l'`environment` utilisé a `production: true` — sinon le garde de
`main.spfx.ts` resterait actif et mockerait au lieu d'erreur en l'absence de contexte hôte.

> Tester **localement contre un vrai backend Sinequa** (sans déploiement SharePoint) est un cas
> distinct et plus délicat : il faudrait un vrai token AAD hors hôte SPFx. Non couvert ici.

## Architecture

```
Page SharePoint
└─ MintWebPart (BaseClientSideWebPart)         ← spfx-host/MintWebPart.ts
   ├─ getClient(resourceUri) ........ AadHttpClient (web-api de la lib → AAD)
   ├─ getTokenProvider() ............ AadTokenProvider (interceptor Angular → AAD)
   ├─ window.__MINT_SPFX_CONTEXT__ = { aadHttpClient, aadTokenProvider, resourceUri, backendUrl, app }
   └─ loadMintAssets(assetsBaseUrl) . injecte styles.css + polyfills.js + main.js
      └─ main.js (build spfx de mint) ← src/main.spfx.ts
         ├─ setGlobalConfig({ backendUrl, app })
         ├─ initializeAadHttpClient(aadHttpClient)   → web-api lib via AAD
         ├─ provide AAD_TOKEN_PROVIDER / AAD_RESOURCE_URI → interceptor aadAuthInterceptorFn
         └─ bootstrapApplication(AppComponent) sur <app-root>
```

Le web part **ne contient pas d'UI** : c'est uniquement la passerelle qui fournit le contexte AAD et
charge le bundle. Toute l'application reste dans mint.

## Contenu

| Fichier | Rôle |
|---|---|
| `MintWebPart.ts` | Web part : récupère le contexte AAD, le publie dans `window.__MINT_SPFX_CONTEXT__`, charge le bundle. |
| `load-mint-assets.ts` | Injection idempotente de `styles.css` + `polyfills.js` + `main.js`. |

À copier dans `src/webparts/mint/` de la solution SPFx (et brancher le manifeste du web part).

## Prérequis

1. **Solution SPFx** générée (`yo @microsoft/sharepoint`), SPFx ≥ 1.20.
2. **App registration Azure AD** de l'API Sinequa, avec **consentement administrateur** accordé au tenant.
3. **Sinequa** configuré pour accepter les jetons Azure AD (provider OAuth/AAD), avec une audience qui
   correspond au `resourceUri` demandé par le web part.
4. **CORS** : le serveur Sinequa doit autoriser l'origine SharePoint (les appels sont **cross-origin**).

## Étapes

### 1. Builder le bundle mint (build `spfx`)
```bash
cd mint-internal
ng build sinequa-mint --configuration spfx
# → dist/sinequa-mint/ (styles.css, polyfills.js, main.js, chunk-*.js, assets/…)
```

### 2. Héberger les assets
Publier le **contenu** de `dist/sinequa-mint/` sur une URL publique (CDN Office 365, bibliothèque
SharePoint, Azure Storage…). Cette URL devient `assetsBaseUrl`. Les chunks lazy se résolvent
relativement à `main.js`, donc tout doit être hébergé **au même endroit**.

### 3. Déclarer la permission API (AAD) dans la solution SPFx
Dans `config/package-solution.json` :
```jsonc
"webApiPermissionRequests": [
  { "resource": "<nom ou App ID de l'app AAD Sinequa>", "scope": "<scope, ex. user_impersonation>" }
]
```
Après déploiement du `.sppkg`, approuver la demande dans **Centre d'administration SharePoint → Accès aux API**.

### 4. Configurer le web part (volet de propriétés)
| Propriété | Exemple | Remarque |
|---|---|---|
| `backendUrl` | `https://sinequa.contoso.com` | **Obligatoire** — voir piège ci-dessous |
| `app` | `mint` | Nom de l'app Sinequa |
| `resourceUri` | `api://sinequa-search/.default` | Doit matcher l'audience validée par Sinequa |
| `assetsBaseUrl` | `https://cdn.contoso.com/mint/` | Où le contenu de `dist/sinequa-mint` est hébergé |

## ⚠️ Pièges

- **`backendUrl` obligatoire.** Dans SharePoint, `window.location.origin` est le site SP (pas Sinequa)
  et il n'y a pas de proxy de dev. Sans `backendUrl`, les `api/v1/*` partent vers SharePoint. Le web
  part le fournit via le contexte ; `main.spfx.ts` l'applique avant le bootstrap.
- **Une seule instance** du web part par page (une seule app Angular). `loadMintAssets` est idempotent
  mais ne protège pas contre deux `<app-root>`.
- **CORS** côté Sinequa pour l'origine SharePoint, sinon les requêtes `AadHttpClient` échouent en preflight.
- **Font Awesome / assets** : si mint en dépend (cf. `src/index.html`), héberger aussi `assets/` et
  décommenter la ligne correspondante dans `load-mint-assets.ts`.
- **Zoneless** : mint utilise `provideZonelessChangeDetection` → pas de `zone.js`, moins de conflits
  avec la page SharePoint.

## Authentification — rappel du flux

`AadHttpClient` porte le bearer AAD sur le web-api de la lib ; l'interceptor `aadAuthInterceptorFn`
le porte sur les appels `HttpClient` Angular directs. Au bootstrap, `signIn()` → `login()` →
`getCsrfToken()` (un **200 sans token** = `null`, pas d'erreur) puis, si pas de session, la sonde
`tryAutoAuthentication()` sur `api/v1/principal` : un **200** (grâce au bearer AAD) = authentifié sans
formulaire de login.

## Packaging — production

Le `package.json` de mint pointe actuellement `@sinequa/atomic` vers un build **local** (`file:`).
Pour la prod : **publier `@sinequa/atomic-spfx`** sur le registre puis repointer l'alias
(`"@sinequa/atomic": "npm:@sinequa/atomic-spfx@^x.y.z"`).

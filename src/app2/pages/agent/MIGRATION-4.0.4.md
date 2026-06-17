# Migration `@sinequa/agent` 4.0.3 → 4.0.4

> Branche `hotfix/agent-404`. Bump `@sinequa/agent` `4.0.3` → `^4.0.4`, alignement de
> l'intégration Mint (`src/app2`) sur la demo de référence (`sba/agent/projects/demo`,
> commit `5931b87e7` du 2026-06-16).

## Résumé

| # | Fichier | Type | Raison |
|---|---------|------|--------|
| 1 | `package.json` | bump | `@sinequa/agent` `4.0.3` → `^4.0.4` |
| 2 | `src/config/agent.providers.ts` | nouveaux providers | surfaces OOTB introduites dans la demo 4.0.4 |
| 3 | `src/app2/pages/agent/agent-page-layout.ts` | nouveaux inputs | pass-through de customisation par instance |
| 4 | `src/components/sidebar-groups/sidebar-user-menu.ts` | **breaking change** | renommage API `AgentsStore` |

Le build (`ng build`) ne passait pas tant que (3) et (4) n'étaient pas faits.

---

## 1. Bump de version

```diff
- "@sinequa/agent": "4.0.3",
+ "@sinequa/agent": "^4.0.4",
```

---

## 2. Nouveaux providers par défaut — `src/config/agent.providers.ts`

La demo 4.0.4 enregistre explicitement les surfaces OOTB : matrice d'affordance
(visibilité/activation des toolbars selon l'état machine), actions de toolbar agent/user,
et composants shell welcome/empty/error.

```diff
  import {
    AGENT_INSTANCE_ID,
    LoggerService,
+   provideDefaultAffordance,
+   provideDefaultAgentToolbarActions,
    provideDefaultDebugPresentation,
+   provideDefaultEmptyComponent,
+   provideDefaultErrorComponent,
    provideDefaultRendererPlugins,
    provideDefaultShikiHighlighterConfig,
    provideDefaultToolCardPlugins,
+   provideDefaultUserToolbarActions,
+   provideDefaultWelcomeComponent,
    RendererService,
    SavedChatsService
  } from "@sinequa/agent";
```

```diff
      // Provide default popup-window strategy for the debug panel
-     provideDefaultDebugPresentation()
+     provideDefaultDebugPresentation(),
+
+     provideDefaultAffordance(),
+     provideDefaultAgentToolbarActions(),
+     provideDefaultUserToolbarActions(),
+     provideDefaultWelcomeComponent(), // garde le hero robot animé
+     provideDefaultEmptyComponent(),   // null (caché) — défaut symétrique
+     provideDefaultErrorComponent()    // null (caché) — défaut symétrique
    ]);
```

> ⚠️ **Piège rencontré** : ne pas dupliquer les providers déjà présents. Une première
> tentative avait ré-enregistré `provideDefaultDebugPresentation` /
> `provideDefaultRendererPlugins` / `provideDefaultShikiHighlighterConfig` /
> `provideDefaultToolCardPlugins` une seconde fois. Chaque provider doit apparaître **une
> seule fois** (comme dans `app.config.ts` de la demo).
>
> Côté Mint, `provideAgent()` est appelé une fois depuis `src/app2/app.config.ts` — aucun
> de ces providers ne doit donc être déclaré ailleurs (pas de double enregistrement).

---

## 3. Inputs de customisation par instance — `agent-page-layout.ts`

La demo expose 6 inputs « pass-through » forwardés tels quels à `<AgentInjector>`. Ils
permettent à une route de surcharger une instance ; non liés, ils laissent s'appliquer le
scope global des providers (`agent.providers.ts`).

```diff
- import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, viewChild } from "@angular/core";
+ import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, Type, untracked, viewChild } from "@angular/core";
```

```diff
  import {
    AGENT_INSTANCE_ID,
    AgentGenerationDirective,
    AgentInjector,
+   type AgentInjectorProvidersHook,
    type AgentSavedChatEvent,
    AgentsStore,
+   type AgentToolbarAction,
    ...
  } from "@sinequa/agent";
```

Déclaration des inputs dans `AgentPageLayoutComponent` :

```ts
readonly welcomeComponent = input<Type<unknown> | null>();
readonly emptyComponent = input<Type<unknown> | null>();
readonly errorComponent = input<Type<unknown> | null>();
readonly agentToolbarActions = input<AgentToolbarAction[]>();
readonly userToolbarActions = input<AgentToolbarAction[]>();
readonly providersHook = input<AgentInjectorProvidersHook>();
```

Binding dans le template (sur `<AgentInjector>`) :

```diff
- <AgentInjector [chatId]="chatId()" [instanceId]="instanceId" />
+ <AgentInjector [chatId]="chatId()" [instanceId]="instanceId"
+     [welcomeComponent]="welcomeComponent()"
+     [emptyComponent]="emptyComponent()"
+     [errorComponent]="errorComponent()"
+     [agentToolbarActions]="agentToolbarActions()"
+     [userToolbarActions]="userToolbarActions()"
+     [providersHook]="providersHook()" />
```

> ⚠️ Le binding template sans la déclaration des inputs (ni les imports `Type`,
> `AgentInjectorProvidersHook`, `AgentToolbarAction`) provoque une erreur de
> template type-check au build. Les deux vont ensemble.

---

## 4. Breaking change API — `AgentsStore` (`sidebar-user-menu.ts`)

La méthode `setDebugMessages(value)` du store a été **renommée** en `setDebugEnabled(value)`.
Le signal de lecture associé est `isDebugEnabled` (lecture seule).

```diff
  effect(() => {
    const debug = this.debug();
-   this.agentsStore.setDebugMessages(debug);
+   this.agentsStore.setDebugEnabled(debug);
    untracked(() => {
      this.userSettingsStore.setDebugMode(debug).catch(err => error("set debug mode failed", err));
    });
  });
```

> Symptôme au build :
> `TS2339: Property 'setDebugMessages' does not exist on type '... AgentsStore ...'`.

---

## Hors périmètre (non synchronisé volontairement)

- Pages démo-only : `aiwp.page`, `aiwp-empty-state`, `customised.page`, `customised-welcome`,
  `custom-actions`, `dual.page`, feature agent-builder.
- `app-sidebar.ts` / `preview-content.ts` — Mint diverge volontairement (panneau saved-chats
  flottant en `<aside>`, `agent-preview` enrichi).
- i18n JSON et `environment.ts` de la demo.
- `themeInitializerFn` (fourni par la demo dans `app.config`) — Mint gère le theming à part.

---

## Vérification

1. **Build** : `ng build` — doit se terminer sans erreur (template type-check + providers).
2. **Runtime** sur `/chat/new` et `/chat/:id` :
   - hero d'accueil (robot animé) sur un nouveau chat ;
   - toolbar message agent : copy / regenerate / like / dislike / debug ;
   - toolbar message user : copy / edit ;
   - sélection d'une référence → ouverture du panneau preview ; historique saved-chats ;
     bouton nouveau chat → reset.
3. **`git diff`** : seuls `package.json`, `src/config/agent.providers.ts`,
   `src/app2/pages/agent/agent-page-layout.ts` et
   `src/components/sidebar-groups/sidebar-user-menu.ts` changent.

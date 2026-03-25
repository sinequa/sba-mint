# Layout `search-all`

```
┌─────────────────────────────────────────────────────────────┐
│                    @if (isMobile())                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  STICKY HEADER (top-17, z-5)                         │   │
│  │  ├── [navbar-tabs]         (si isTabSearchActive)    │   │
│  │  ├── [filters-bar]                                   │   │
│  │  └── [app-search-actions]  (sticky top-28/top-45)    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  COLONNE 1 — Résultats (w-full)                      │   │
│  │  └── <ng-template #resultsList>                      │   │
│  │      ├── [CardSkeleton x3]  (si query.isPending)     │   │
│  │      ├── <ul> records       (si hasRowCount)         │   │
│  │      │   └── [NgComponentOutlet] par article         │   │
│  │      ├── [feedback]         (fixed, bottom-3)        │   │
│  │      ├── [infinity-scroll]  (si hasNextPage)         │   │
│  │      └── [NoResult]         (sinon)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  [sheet-previewer]  (hidden md:block)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    @else (Desktop)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  STICKY HEADER (top-17, z-5)                         │   │
│  │  ├── [navbar-tabs]         (si isTabSearchActive)    │   │
│  │  └── [filters-bar]                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌─── flex, h-(--search-content-height), overflow-hidden ──┐│
│  │                                                         ││
│  │  ┌────────────────────────┐  ┌──────────────────────┐   ││
│  │  │  COL 2 — Résultats     │  │  COL 3 — Droite      │   ││
│  │  │  (grow, overflow-y)    │  │  (mx-4, w-1/4→w-1/2) │   ││
│  │  │                        │  │  overflow-hidden     │   ││
│  │  │  [app-search-actions]  │  │                      │   ││
│  │  │                        │  │  [preview]           │   ││
│  │  │  └── #resultsList      │  │   ↕ slide anim       │   ││
│  │  │      (ng-template)     │  │  [app-search-        │   ││
│  │  │                        │  │   overview]          │   ││
│  │  │                        │  │   ↕ slide anim       │   ││
│  │  │                        │  │                      │   ││
│  │  │                        │  │  (visible si         │   ││
│  │  │                        │  │   hasRowCount)       │   ││
│  │  └────────────────────────┘  └──────────────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Points clés

| Bloc | Rôle |
| --- | --- |
| **Sticky Header** | Onglets + filtres, collé en haut au scroll |
| **app-search-actions** | Sélection tout / actions sur les résultats. `top-28` sur mobile strict, `top-45` sur tablette (768–1024px) |
| **#resultsList** | `ng-template` défini une seule fois, utilisé dans les deux branches mobile et desktop via `ngTemplateOutlet` |
| **COL 2 — Résultats** | Liste principale avec infinite scroll |
| **COL 3 — Droite** | `mx-4` + `overflow-hidden` sur le conteneur. Panneau coulissant : soit `preview` (document sélectionné), soit `app-search-overview` (AI assistant) — mutuellement exclusifs via animation slide. Les deux composants restent **toujours dans le DOM** (voulu) pour éviter le destroy/recreate et conserver leur état entre les transitions. |
| **sheet-previewer** | Version mobile du panneau preview (drawer) |
| **feedback** | Bouton flottant fixe (bottom-3), masqué en mobile |
| **--search-content-height** | CSS variable définie dans `:host` = `calc(100dvh - 230px)`, utilisée pour la hauteur du conteneur desktop |

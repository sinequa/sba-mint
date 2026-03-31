# Layout `search-all`

```
┌─────────────────────────────────────────────────────────────┐
│                    @if (isMobile())                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  STICKY HEADER (top-17, z-5)                         │   │
│  │  ├── [navbar-tabs]         (if isTabSearchActive)    │   │
│  │  ├── [filters-bar]                                   │   │
│  │  └── [app-search-actions]  (sticky top-28/top-45)    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  COLUMN 1 — Results (w-full)                         │   │
│  │  └── <ng-template #resultsList>                      │   │
│  │      ├── [CardSkeleton x3]  (if query.isPending)     │   │
│  │      ├── <ul> records       (if hasRowCount)         │   │
│  │      │   └── [NgComponentOutlet] per item            │   │
│  │      ├── [feedback]         (fixed, bottom-3)        │   │
│  │      ├── [infinity-scroll]  (if hasNextPage)         │   │
│  │      └── [NoResult]         (otherwise)              │   │
│  └──────────────────────────────────────────────────────┘   │
│  [sheet-previewer]  (hidden md:block)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    @else (Desktop)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  STICKY HEADER (top-17, z-5)                         │   │
│  │  ├── [navbar-tabs]         (if isTabSearchActive)    │   │
│  │  └── [filters-bar]                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌─── flex, h-(--search-content-height), overflow-hidden ──┐│
│  │                                                         ││
│  │  ┌────────────────────────┐  ┌──────────────────────┐   ││
│  │  │  COL 2 — Results       │  │  COL 3 — Right       │   ││
│  │  │  (grow, overflow-y)    │  │  (mx-4, w-1/4→w-1/2) │   ││
│  │  │                        │  │  overflow-hidden     │   ││
│  │  │  [app-search-actions]  │  │                      │   ││
│  │  │                        │  │  [preview]           │   ││
│  │  │  └── #resultsList      │  │   ↕ slide anim       │   ││
│  │  │      (ng-template)     │  │  [app-search-        │   ││
│  │  │                        │  │   overview]          │   ││
│  │  │                        │  │   ↕ slide anim       │   ││
│  │  │                        │  │                      │   ││
│  │  │                        │  │  (visible if         │   ││
│  │  │                        │  │   hasRowCount)       │   ││
│  │  └────────────────────────┘  └──────────────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Key points

| Block | Role |
| --- | --- |
| **Sticky Header** | Tabs + filters, pinned to the top on scroll |
| **app-search-actions** | Select all / bulk actions on results. `top-28` on strict mobile, `top-45` on tablet (768–1024px) |
| **#resultsList** | `ng-template` defined once, reused in both mobile and desktop branches via `ngTemplateOutlet` |
| **COL 2 — Results** | Main list with infinite scroll |
| **COL 3 — Right** | `mx-4` + `overflow-hidden` on the container. Sliding panel: either `preview` (selected document) or `app-search-overview` (AI assistant) — mutually exclusive via slide animation. Both components are **always kept in the DOM** (intentional) to avoid destroy/recreate and preserve their state across transitions. |
| **sheet-previewer** | Mobile version of the preview panel (drawer) |
| **feedback** | Fixed floating button (bottom-3), hidden on mobile |
| **--search-content-height** | CSS variable defined in `:host` = `calc(100dvh - 210px)`, used for the desktop container height |

---
title: Introduction
---

# Atomic Angular Library

The Atomic Angular library provides a structured and reusable set of Angular components, models, services, stores, and utilities
that facilitate the development of applications within the Sinequa framework. This library helps developers efficiently build
and maintain Angular applications by offering pre-built, modular, and easily integrable functionalities.

## Overview

This documentation will guide you through:

- **Components**: Reusable UI elements
- **Services**: Business logic and API integrations
- **Stores**: Centralized state management
- **Directives**: Custom behaviors for DOM elements
- **Pipes**: Data transformation for templates
- **Guards**: Route protection and access control
- **Interceptors**: HTTP request/response processing
- **Utilities**: Helper functions and development tools
- **Tokens**: Injection tokens for DI configuration

## Recent Changes

### New

- **[UserProfileService](services/user-profile.md)**: Fetches user profiles reactively via `httpResource`
- **[FileSizePipe](pipes/file-size.md)**: Converts byte counts to human-readable size objects
- **[SelectArticleDirective](directives/select-article.md)**: Selects articles on click with configurable `SelectionStrategy`
- **[SelectionStrategy](directives/selection-strategy.md)**: Union type for article selection behavior (`replace`, `stack`, `redirect`, `emit`)
- **[ChildMarkerDirective](directives/child-marker.md)**: Marks child elements for dynamic structural composition
- **[InlineWorker](utils/inline-worker.md)**: Creates Web Workers inline from plain functions
- **[withFetch](utils/with-fetch.md)**: Wraps async calls with automatic 401/404 error handling
- **[HIGHLIGHTS token](tokens/highlights.md)**: Injection token for configuring preview highlight colors

### Deprecated

- **[PrincipalService](services/principal.md)**: Use `PrincipalStore` instead
- **[SearchService](services/search.md)**: Use `QueryService` instead
- **[SourceIconPipe](pipes/source-icon.md)**: Use `SourceComponent` instead
- **[SelectArticleOnClickDirective](directives/select-article-on-click.md)**: Use `SelectArticleDirective` instead
- **[ShowBookmarkDirective](directives/show-bookmark.md)**: Replaced by bookmark state from `UserSettingsStore`
- **[APP_FEATURES token](tokens/features.md)**: Use `general` config from `AppStore` instead

### Updated

- **[Aggregations Service](services/aggregations.md)**: Methods `loadMore()` and `open()` documented
- **[Preview Service](services/preview.md)**: Full method coverage including `zoomIn/zoomOut`, `toggleAIDescription`, `sendMessage`
- **[Query Service](services/query.md)**: `search()`, `bulkSearch()`, `gotoPage()` with full signatures
- **[Audit Service](services/audit.md)**: All notify methods documented
- **[User Settings Store](stores/user-settings.md)**: Full method coverage across bookmarks, baskets, alerts, and saved searches
- **[Aggregations Store](stores/aggregations.md)**: `update()`, `updateAggregation()`, `clear()`, `getAggregation()`
- **[Query Params Store](stores/query-params.md)**: `addFilter()`, `updateFilter()`, `clearFilter()`, `patch()`
- **[Theme Store](stores/theme.md)**: `loadDefaultTheme()`, `setCurrentTheme()`, `processCssVars()`
- **[Highlights Token](tokens/highlights.md)**: Restructured with types table and override example
- **[Interceptors](interceptors/audit.md)**: All five interceptors updated to use `withInterceptors` (lowercase)
- **[OpenArticleOnCtrlEnter](directives/open-article-on-ctrl-enter.md)**: Input table added
- **[ThemeProvider](directives/theme-provider.md)**: Input table added
- **[InfiniteScroll](directives/infinite-scroll.md)**: Outputs table added

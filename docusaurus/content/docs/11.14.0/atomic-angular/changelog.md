---
title: 📝 Recents Changes
---

The documentation is updated regularly to include the latest features, bug fixes, and enhancements.

### 🚀 New Features

* [feature-flags](components/feature-flags): Added a dialog to toggle feature flags live at runtime, gated to administrators.
* [navbar-tabs](components/navbar-tabs): Persist active filters when switching between tabs. (ES-29749)
* [filters](components/filters):
  * Added support for vertical rendering.
  * Added `aggregations` input to allow specifying which filters to display in the bar.
* [overflow-manager](directives/overflow-manager.md): Added support for vertical overflow detection, allowing for better
handling of lists that exceed the visible area in a vertical layout.

### ✨ Updates

* [Auth guard](guards/auth.md) / [Auth interceptor](interceptors/auth.md):
  * Show a signed-out view on `/logout` instead of the re-authentication loader.
  * Hardened cookie/proxy SSO — send credentials and re-probe the session before reloading.
  * Documented OIDC auto-authentication and token-expiry re-authentication.
* [Search service](services/search.md): Prefix the static index fetch with the configured `basePath`.
* [preview](services/preview.md): Enhanced the preview service to support custom highlights and improved interaction with the preview iframe.
* [Aggregations service](services/aggregations.md): Updated to include methods for loading more aggregation items and opening aggregation nodes.  
* [App store](stores/app):
  * Updated documentation to clarify the use of [`getAuthorizedFilters`](stores/app#getauthorizedfilters).
  * Removed the `route` parameter from the `getAuthorizedFilters` method to simplify its usage.
  * Added [`getAuthorized`](stores/app#getauthorized) method for retrieving a subset of authorized filters.
* [Did You Mean](components/did-you-mean): Improved the Did You Mean component to handle more complex queries and provide better suggestions.
* [Metadata](components/metadata): Enhanced the Metadata component to support custom templates and improved rendering of complex metadata types.  
* [Sort Selector](components/sort-selector): Updated the Sort Selector component to allow for custom sorting options (Tab Search options).
* [JSON Method Plugin](services/json-method-plugin.md): Updated examples to use Angular's dependency injection.

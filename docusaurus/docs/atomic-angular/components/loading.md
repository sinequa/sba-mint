---
title: Loading
---

## Overview

The `Loading` component is an Angular component that displays a loading state while redirecting to a new URL (specified by the `returnUrl` query parameter). It automatically redirects to the error page if the redirection does not complete within a short delay.

## Examples

The `LoadingComponent` is intended to be used in the application's routing configuration, typically when a `returnUrl` query parameter is present:

```ts
{ path: 'loading', component: LoadingComponent }
```

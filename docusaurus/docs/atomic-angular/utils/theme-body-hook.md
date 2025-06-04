---
title: Theme Body Hook
---
## Overview

`withThemeBodyHook` function allow you to create a special scope, declared with `APPLICATION_THEME_SCOPE = 'application'`, attached to the `<body>` tag using `window.document.body` reference. It will call `themeStore.loadDefaultTheme()` to set everything up at application's bootstrap.

If you want to use a theme over your entire application this is your way to go.

```ts
const THEMES = [{...}];

bootstrapApplication(AppComponent, appConfig)
  .then((app) => withThemes(app, THEMES))
  .then(withThemeBodyHook)
  .catch((err) => console.error(err));
```

---
title: WithThemes()
sidebar_position: 2
---

## Overview

`withThemes()` function allow you to push your own theme into the theme array and make it available to use.

```ts
const THEMES = [{...}];

bootstrapApplication(AppComponent, appConfig)
  .then((app) => withThemes(app, THEMES))
  .catch((err) => console.error(err));
```

Exporting themes from a dedicated file is recommended, as themes can be pretty heavy.

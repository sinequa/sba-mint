---
title: Log levels
---

# Introduction

Log levels uses `@sinequa/atomic-js` log levels and provides a Angular function to provide it at application bootstrap.

See [atomic log levels](/atomic/log-levels) for more information.

:::info
You can use the basic `atomic-js` function or the Angular function for your application, they do the exact same thing.
:::

## Usage

Use the `withConsoleLogLevels` function to apply the log levels to the console.

```ts title="main.ts"
// ... imports
import { applyConsoleLogLevels } from "@sinequa/atomic";

// ...
bootstrapApplication(AppComponent, appConfig)
  .then(withConsoleLogLevels)
  .catch(
    //...
  );
```

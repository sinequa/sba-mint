---
title: Log levels
---

# Introduction

Log levels allows user to see different levels of logs in the console, by setting a level you imply more restrictive levels with it.

The log levels, from less to most restrictive, are:
  - `all`: you'll see every messages from the application
  - `debug`: you'll see debug messages and above, should be used for development purposes
  - `log`: you'll see log messages and above
  - `info`: you'll see info messages and above, ie. application or component mode, package versions, etc.
  - `warn`: you'll see warn messages and above, ie. configuration issues with fallback values, third party license duration reminder, etc.
  - `error`: you'll see only error messages, ie. missing required configuration, failed to login, etc.
  - `none`: you won't see **any** messages from the application

:::info
If no log level is defined, the default will be used, default log level is `log`.
:::

:::warning
Log levels works by overriding the default `window.console` object, and therefor, you **need to call setup functions** to make it work, even with no arguments.
That means you'll see log levels applied **from the moment** you call the setup function, and not before.
:::


## Usage

You can set a log level at the start up of the application by calling `applyConsoleLogLevels()`.
The log level is defined in the `globalConfig` object. As it's evaluated on each `console` call, you can change its value at any time.


```ts title="console.ts"
export enum LogLevel {
  'all' = 0,
  'debug',    // 1
  'log',      // 2
  'info',     // 3
  'warn',     // 4
  'error',    // 5
  'none'      // 6
};
```

```ts title="global.config.ts"
export type AppGlobalConfig = {
  //...
  logLevel?: LogLevel
}
```

```ts title="main.ts"
// ... imports
import { environment } from './environments/environment';

// ...
setGlobalConfig(environment);
applyConsoleLogLevels();        // log level is applied from this line
```

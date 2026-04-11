---
title: Logger
sidebar_class_name: update
---

This module provides a centralized, configurable logging system with multiple severity levels. The log level can be controlled at runtime to filter output and optionally disable console output entirely.

## Configuration

Configure the logger using `configureLogger()`. Settings are applied globally.

```typescript
import { configureLogger, LogLevel } from '@sinequa/atomic';

configureLogger({
  level: LogLevel.DEBUG,
  enableConsoleOutput: true
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | `LogLevel` | `LogLevel.INFO` | Minimum severity level to output |
| `enableConsoleOutput` | `boolean` | `true` | Whether to write messages to the browser console |

## Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,  // Fine-grained debug information
  INFO  = 1,  // General application flow
  WARN  = 2,  // Potential issues or unexpected states
  ERROR = 3,  // Errors that may affect normal operation
  NONE  = 4,  // Disables all logging
}
```

## Functions

| Function | Description |
|----------|-------------|
| `configureLogger(config)` | Merge a partial config into the logger settings |
| `debug(message, data?)` | Log at `DEBUG` level |
| `info(message, data?)` | Log at `INFO` level |
| `warn(message, data?)` | Log at `WARN` level |
| `error(message, error?)` | Log at `ERROR` level |

**Example**

```typescript title="logger.ts"
import { debug, info, warn, error, configureLogger, LogLevel } from '@sinequa/atomic';

configureLogger({ level: LogLevel.DEBUG });

info('User logged in successfully.');
// [INFO] User logged in successfully.

debug('Processing user data.', { userId: 123, role: 'admin' });
// [DEBUG] Processing user data. { userId: 123, role: 'admin' }

warn('API request timed out. Retrying...');
// [WARN] API request timed out. Retrying...

try {
  throw new Error('Database connection failed');
} catch (e) {
  error('Unexpected error during database operation.', e);
  // [ERROR] Unexpected error during database operation. Error: Database connection failed
}

// Filter to WARN and above only
configureLogger({ level: LogLevel.WARN });
info('This will NOT be logged.');
warn('This WILL be logged.');

// Disable console output
configureLogger({ enableConsoleOutput: false });
```

## LoggerConfig Schema

```typescript
interface LoggerConfig {
  level: LogLevel;
  enableConsoleOutput: boolean;
}
```

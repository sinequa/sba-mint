---
title: Logger
---

This module provides a centralized and configurable logging system. It allows for standardized logging across
the application with different severity levels. The logger can be configured to control the minimum log level
to output and whether messages should be displayed in the console.

## Configuration

The logger can be configured using the `configureLogger` function. This function accepts a partial `LoggerConfig` object.

```typescript
import { configureLogger, LogLevel } from '@sinequa/atomic';

// Example configuration
configureLogger({
  level: LogLevel.DEBUG, // Set the minimum level to DEBUG
  enableConsoleOutput: true // Ensure console output is enabled
});
```

### Options

| Option                | Default Value     | Description                                                                 |
| --------------------- | ---------------- | --------------------------------------------------------------------------- |
| `level`               | `LogLevel.INFO`  | Specifies the minimum `LogLevel` to be logged. Messages with a severity lower than this level will be ignored. |
| `enableConsoleOutput` | `true`           | A boolean indicating whether log messages should be output to the browser's console. |

### Default Configuration

If `configureLogger` is not called, the logger uses the following default settings:

```typescript
{
  level: LogLevel.INFO,
  enableConsoleOutput: true
}
```

## Usage

Import the logging functions (`debug`, `info`, `warn`, `error`) from the module to log messages.

```typescript
import { debug, info, warn, error, configureLogger, LogLevel } from '@sinequa/atomic';

// Optional: Configure the logger (e.g., during app initialization)
configureLogger({ level: LogLevel.DEBUG });

// --- Basic Usage ---

// Log informational messages
info('User logged in successfully.');
// Output: [INFO][<timestamp>] User logged in successfully.

// Log debug messages (only shown if level is DEBUG)
debug('Processing user data.', { userId: 123, role: 'admin' });
// Output (if LogLevel is DEBUG): [DEBUG][<timestamp>] Processing user data. { userId: 123, role: 'admin' }

// Log warnings
warn('API request timed out. Retrying...');
// Output: [WARN][<timestamp>] API request timed out. Retrying...

// Log errors
try {
  // Some operation that might fail
  throw new Error('Database connection failed');
} catch (e) {
  error('An unexpected error occurred during database operation.', e);
  // Output: [ERROR][<timestamp>] An unexpected error occurred during database operation. Error: Database connection failed
}

// --- Logging with Additional Data ---

const user = { id: 456, name: 'Jane Doe' };
info('User profile updated.', user);

debug('Current configuration loaded.', { settingA: true, settingB: 'value' });

// --- Controlling Log Output ---

// Set level to WARN, so INFO and DEBUG messages are ignored
configureLogger({ level: LogLevel.WARN });

info('This message will NOT be logged.'); // Ignored
debug('This debug data will NOT be logged.'); // Ignored
warn('This warning WILL be logged.'); // Logged
error('This error WILL be logged.'); // Logged

// Disable console output entirely
configureLogger({ enableConsoleOutput: false });

warn('This warning will NOT appear in the console.'); // Not logged to console
error('This error will NOT appear in the console.'); // Not logged to console

// Re-enable console output and set level back to INFO
configureLogger({ level: LogLevel.INFO, enableConsoleOutput: true });
info('Logging is back to normal.'); // Logged to console
```

## Log Levels

The `LogLevel` enum defines the different severity levels for log messages. When configuring the logger, you set the minimum level that should be processed.

```typescript
export enum LogLevel {
  DEBUG = 0,  // Detailed information, typically only relevant for developers
  INFO = 1,   // General information about application flow
  WARN = 2,   // Indicates potential issues or unexpected situations
  ERROR = 3,  // Indicates errors that prevent normal operation
  NONE = 4    // Disables all logging
}
```

* **DEBUG (0):** Use for fine-grained informational events that are most useful to debug an application.
* **INFO (1):** Use for informational messages that highlight the progress of the application at coarse-grained level.
* **WARN (2):** Use for potentially harmful situations or events that might lead to errors.
* **ERROR (3):** Use for error events that might still allow the application to continue running.
* **NONE (4):** The highest level, intended to turn off logging. If the logger level is set to `NONE`, no messages will be logged.

---

## LoggerConfig Schema

```typescript
interface LoggerConfig {
  level: LogLevel;
  enableConsoleOutput: boolean;
  // Can be extended with other output destinations like remote logging service
}
```

---

## Summary Table

| Function           | Purpose                                                      |
|--------------------|--------------------------------------------------------------|
| `configureLogger`    | Configure the logger's level and output options              |
| `debug`              | Log a debug message                                          |
| `info`               | Log an informational message                                 |
| `warn`               | Log a warning message                                        |
| `error`              | Log an error message                                         |

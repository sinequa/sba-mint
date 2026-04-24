---
title: Introduction
---

This library is a comprehensive toolkit for building web applications integrated with Sinequa services. It provides modular, type-safe building blocks for authentication, API communication, configuration management, and a rich set of utilities.

## Key Features

- **Authentication** — Login/logout with support for credentials, SSO, OAuth, and SAML flows. Token management (CSRF, JWT) with automatic session storage.

- **Configuration** — Centralized `globalConfig` object with a `setGlobalConfig()` function to customize backend URL, app name, authentication providers, log level, and more.

- **API** — Typed wrappers for all major Sinequa v1 and v2 endpoints:
  - Search queries (single and bulk), aggregations, datasets, suggestions
  - User settings, user profiles, labels
  - Document preview, text chunks, similar documents, sponsored links
  - Export, query intent detection
  - Password management, server version

- **Notifications** — Event-based notification system (`notify.success`, `notify.info`, `notify.warning`, `notify.error`) dispatched as DOM `CustomEvent`s.

- **Audit** — Utilities to record audit events and enrich request bodies with session IDs and URLs.

- **Web API Helpers** — Low-level HTTP utilities (GET, POST, PUT, PATCH, DELETE), structured error classes (`ApiError`, `UnauthorizedError`, `TimeoutError`, `ServerError`), retry logic, and timeout controllers.

- **Utilities** — A rich set of helpers:
  - **Date** — Localized relative date strings (`getRelativeDate`)
  - **Concepts** — Parse and rewrite advanced search query patterns
  - **Query params** — Serialize/deserialize search state from/to URLs
  - **Logger** — Configurable logging system with `LogLevel` enum
  - **Bisect** — Partition arrays by predicate
  - **sysLang** — Legacy multilingual string extraction
  - **isNotInputEvent** — Keyboard event routing helper

- **Helpers** — String and type utilities: `guid`, `escapeExpr`, `sha512`, `isObject`, `isBlob`, `isArrayBuffer`, `isJsonable`, `getMetadata`, `resolveToColumnName`, `KeyOf`.

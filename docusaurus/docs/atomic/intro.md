---
title: Introduction
---

This library is a comprehensive toolkit for developers building web applications, offering essential modules for authentication, configuration management, API interactions, and a wide range of utility functions. Its modular structure and detailed documentation make it accessible for developers at all levels.

## Key Features

- **Authentication**: Manage user login, logout, token handling, and support for OAuth/SAML flows.
- **Configuration**: Centralize and customize global configuration parameters for seamless integration and environment management.
- **API Interactions**: Simplify communication with backend services, including querying, aggregations, and user settings.
- **Utilities**: A rich set of helpers for common tasks:
  - **Date utilities**: Generate human-readable relative dates and calculate date differences.
  - **Concepts utilities**: Parse, rewrite, and manipulate search concepts and patterns in text.
  - **Query params utilities**: Extract and parse query parameters and filters from URLs.
  - **System language utility**: Extract and translate multilingual strings based on locale.
  - **Logger**: Configurable logging system with multiple log levels and output options.
  - **Other helpers**: Functions like `escapeExpr()`, `sha512()`, `resolveToColumnName()`, and more for string, security, and query handling.

These features collectively provide a robust foundation for building secure, configurable, and efficient web applications integrated with Sinequa services. The documentation covers each module and utility in detail for easy onboarding and reference.

## Changelog

### New Features

- [**Notification System**](utils/notification.md): A simple, event-based API for dispatching user notifications of various types (success, info, warning, error) throughout your application.

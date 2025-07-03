---
title: Introduction
---

# Atomic Angular Library

The Atomic Angular library provides a structured and reusable set of Angular components, models, services, stores, and utilities
that facilitate the development of applications within the Sinequa framework. This library helps developers efficiently build
and maintain Angular applications by offering pre-built, modular, and easily integrable functionalities.

## 📋 Overview

This documentation will guide you through:

- **Components**: Reusable UI elements
- **Services**: Business logic and API integrations
- **Stores**: Centralized state management
- **Directives**: Custom behaviors for DOM elements
- **Utilities**: Helper functions and development tools

## 📈 Recent Changes

The documentation is updated regularly to include the latest features, bug fixes, and enhancements.

### 🚀 New Features

- **[Filters](components/filters)**: Added support for vertical rendering
- **[Overflow Manager](./directives/overflow-manager.md)**: Added support for vertical overflow detection, allowing for better
  handling of lists that exceed the visible area in a vertical layout

### ✨ Updates

- **[Preview](services/preview.md)**: Enhanced the preview service to support custom highlights and improved interaction
  with the preview iframe
- **[Aggregations Service](services/aggregations.md)**: Updated to include methods for loading more aggregation items
  and opening aggregation nodes
- **[App Store](stores/app)**: Updated documentation to clarify the use of
  [`getAuthorizedFilters`](stores/app#getauthorizedfilters) for retrieving sorted aggregations based on a query name
  and added missing methods
- **[Metadata](components/metadata.md)**: Typos fixed and minor improvements in the documentation
- **[Sort Selector](components/sort-selector.md)**: Updated to clarify the logic for retrieving sorting options
  and added examples for better understanding
- **[Did You Mean](components/did-you-mean.md)**: Updated to clarify the usage of the `didYouMean` property
  for better understanding

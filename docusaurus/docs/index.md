---
layout: default
title: Introduction
sidebar_position: 1
description: "Sinequa's SBA Framework Documentation"
slug: /
---

# Welcome to Mint

Mint is a powerful application boilerplate designed to streamline the development of web applications integrated with Sinequa services. It provides a robust set of tools and features to help developers build efficient, secure, and highly configurable applications.

import useBaseUrl from '@docusaurus/useBaseUrl';

:::warning
This project is only compatible with Angular 20+ \
Node.js v20+ is required to run the project.
:::

## Technical stack

- **Tailwindcss**: Utility-first CSS framework.
  [https://tailwindcss.com/docs/installation](https://tailwindcss.com/docs/installation)
- **tanstack query**: Asynchronous state management.
  [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **ngrx/signals/signal-store**: Fully-featured state management solution.
  [https://ngrx.io/guide/signals/signal-store](https://ngrx.io/guide/signals/signal-store)
- **@jsverse/transloco**: Internationalization library.
  [https://jsverse.github.io/transloco/](https://jsverse.github.io/transloco/)
- **@sinequa/atomic**: Sinequa's core Atomic library (framework-agnostic logic, services, and utilities).
  [https://www.npmjs.com/package/@sinequa/atomic](https://www.npmjs.com/package/@sinequa/atomic)
- **@sinequa/atomic-angular**: Angular-specific Sinequa components and features.
  [https://www.npmjs.com/package/@sinequa/atomic-angular](https://www.npmjs.com/package/@sinequa/atomic-angular)
- **@sinequa/ui**: Sinequa's UI component library.
  [https://www.npmjs.com/package/@sinequa/ui](https://www.npmjs.com/package/@sinequa/ui)

## General structure of the application

```ascii
📁 app                // Contains files related to the application
├── 📁 components     // Groups components specific to the application
├── 📁 pages          // Contains components related to pages
├── 📁 registry       // Contains the registry of components used in the application (subject to change)
📁 assets             // Contains static resources like images, global CSS files, and other necessary files
                      // for the application
📁 css-overrides      // Contains CSS overrides (mandatory) to use the Assistant component.
📁 environments       // Contains environment-specific configuration files to manage environment variables
                       // and other deployment-specific configurations
```

### 📁 app

The `app` folder is the core of the Angular application, containing the main components, configurations, routes, and services needed to build the user interface. Here is a detailed description of its content and role in the application:

```ascii
📁 app                      # Main application folder (components, pages, config, routes)
├── 📁 components           # App-specific reusable components
├── 📁 pages                # Page-level components (home, search, widgets, etc.)
├── 📁 registry             # Document type registry and related logic
├── 🏷️ tokens.ts            # App-wide tokens
├── ⚙️ app.config.ts        # App configuration and providers
├── 🧩 app.component.ts     # Root component logic
├── 📝 app.component.html   # Root component template
├── 🗺️ routes.ts            # Application routes
└── 🌐 transloco-loader.ts  # i18n loader
```

In summary, the `app` folder contains the essential elements for the operation of the Angular application, including the root component, global configuration, routing, and internationalization. It serves as the entry point for the application's structure and business logic.

### 📁 pages

This is where the application pages are located as described in the routes file: _app.routes.ts_.

There are currently 4 main pages:

- **Home**, the home page
- **Search**, the search page. It is further divided into several other pages by existing tabs.
  - **All**, which contains the component(s) that will be used to display search results for the "All" tab.
  - Other tabs can be added as needed.
- **Widgets**, which contains the widgets used in the application.
- **Assistant**, which contains the layout for the assistant feature. This route needs a specific configuration to be enabled.

```ascii
```ascii
📂 pages
├── 📁 assistant/               # Contains the layout for the assistant feature.
│   └── 🧩 assistant.layout
│
├── 📁 home/                    # This is the landing page. It displays the most
│   │                            recently viewed documents, recent searches, and bookmarks.
│   └── 🧩 home
│
├── 📁 search/                  # Contains the search page layout and its subpages.
│   ├── 📁 all/                 # Contains the component(s) that will be used to display 
│   │   │                        search results for the "All" tab.
│   │   └── 🧩 search-all
│   └── 🧩 layout
│
├── 📁 widgets/
│   ├── 📁 bookmarks/           # Contains components related to bookmarks widget.
│   ├── 📁 collections/         # Contains components related to collections widget.
│   ├── 📁 recent-searches/     # Contains components related to recent searches widget.
│   ├── 📁 saved-searches/      # Contains components related to saved searches widget.
│   └── 🧩 layout               # Layout component for widgets section.
│
└── 🧩 app.component            # The main application component.
```

:::note
It is possible to use different components for each tab or for each type of returned documents. For this, you need to look at the file _app/registry/document-type-registry.ts_.

For simplicity reasons, in "Mint" we use only one component to display a result regardless of the tab or its type (html, pdf, slide...)
:::

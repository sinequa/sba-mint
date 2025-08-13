# Sinequa Mint

A modern Angular 20+ application boilerplate for building scalable, maintainable, and Sinequa-integrated web apps.

---

## 📺 Introduction

- [Changelog](#changelog)
- [Introduction video](https://vimeo.com/1025523759/82481a5803?share=copy)
- [Documentation website](https://sinequa.github.io/sba-mint/)

---

## 📁 Project Structure

```ascii
📁 src                 # Source folder
├── 📁 app             # Main application folder (components, pages, config, routes)
│   ├── 📁 components  # App-specific reusable components
│   ├── 📁 pages       # Page-level components (home, search, widgets, etc.)
│   ├── 📁 registry    # Document type registry and related logic
│   ├── 🏷️ tokens.ts   # App-wide tokens
│   ├── ⚙️ app.config.ts      # App configuration and providers
│   ├── 🧩 app.component.ts   # Root component logic
│   ├── 📝 app.component.html # Root component template
│   ├── 🗺️ routes.ts          # Application routes
│   └── 🌐 transloco-loader.ts# i18n loader
├── 📁 assets          # Static assets (images, SVGs, error pages, preview scripts, i18n)
├── 📁 environments    # Environment-specific configuration
├── 🎨 styles.css      # Global styles (Tailwind, custom CSS)
├── 🏠 index.html      # Main HTML entry point
├── 🚀 main.ts         # Angular bootstrap
└── 🧩 polyfills.js    # Polyfills for browser compatibility
```

---

## 🧩 Libraries Used

- [`@sinequa/ui`](https://www.npmjs.com/package/@sinequa/ui): Sinequa's UI component library (framework-agnostic)
- [`@sinequa/atomic`](https://www.npmjs.com/package/@sinequa/atomic): Sinequa's core Atomic library (framework-agnostic logic, services, and utilities)
- [`@sinequa/atomic-angular`](https://www.npmjs.com/package/@sinequa/atomic-angular): Angular-specific Sinequa components and features

---

## 🚀 Getting Started

### Development Server

```sh
ng serve
```

Navigate to [http://localhost:4200/](http://localhost:4200/). The app reloads automatically on file changes.

### Code Scaffolding

```sh
ng generate component component-name
```

You can also use:

- `ng generate directive|pipe|service|class|guard|interface|enum|module`

### Build

```sh
ng build
```

Build artifacts are stored in the `dist/` directory.

---

## 🧩 Features

- Angular 20+ with Signals and Standalone Components
- Modular structure: `/app` for business logic
- Sinequa integration (search, analytics, user settings)
- UI components from `@sinequa/ui`, core logic from `@sinequa/atomic`, and Angular features from `@sinequa/atomic-angular`
- State management with NgRx Signals and TanStack Query
- Internationalization with Transloco
- TailwindCSS for utility-first styling and custom plugins
- Modern UI components (Drawer, Preview, Bookmarks, etc.)
- Authentication and user management
- Audit and API interaction utilities

---

## 📚 Documentation

- [Full Documentation](https://sinequa.github.io/sba-mint/)
- [Core Concepts](docusaurus/docs/mint/overview.mdx)
- [App Structure](docusaurus/docs/mint/pages.mdx)
- [Stores & State](docusaurus/docs/mint/core/stores.mdx)
- [Customizing Components](docusaurus/docs/mint/overview.mdx#corecomponents)

---

## 🛠️ Technical Stack

- **Framework:** Angular 20+
- **State Management:** NgRx Signals, TanStack Query
- **UI Libraries:** @sinequa/ui, @sinequa/atomic, @sinequa/atomic-angular, Angular CDK
- **Internationalization:** Transloco
- **Styling:** TailwindCSS, CSS
- **Linting & Formatting:** ESLint, Prettier
- **Build Tools:** Angular CLI, TypeScript
- **Other:** Husky (git hooks), lint-staged, ngx-sonner, RxJS

---

## 🛠️ Further Help

- [Angular CLI Overview and Command Reference](https://angular.io/cli)
- [Sinequa Documentation](https://doc.sinequa.com/)

---

## Changelog

### 2025-08-11

- query params store: now manage the URL's queryparams synchronization. No need for manual handling with `router.navigate()`
- autocomplete component:
  - we reworked the component to be fully compatible with Firefox. Standard HTML Anchor popovertarget not fully supported with Firefox. Now we use our own popover implementation.
  - we removed the use of the Fontawesome's icons in favor of SVGs. Low performance with Fontawesome icons.
  - all suggestion's category (kind) are now displayed correctly.
  - category (kind) are now sticky to top while scrolling.
- search input component: we resolved the remaining issues in the previous update.
- styles.css: we moved the `animate-save` animation into the global css file. you can now use it across your application using Tailwindcss.
- tsconfig.ts: we removed the `paths` mapping for `@sinequa/atomic` and `@sinequa/atomic-angular`. Libraries have been updated to avoid the need for these mappings.

| Package                 | Version    |
|-------------------------|------------|
| @sinequa/assistant      | 3.9.4      |
| @sinequa/atomic         | ^0.0.109   |
| @sinequa/atomic-angular | ^0.1.46    |
| @sinequa/ui             | ^0.1.10    |

---

## 📞 Contact Us

Interested in Sinequa?  
Contact us by [email](mailto:info@sinequa.com) or visit our [contact page](https://www.sinequa.com/contact/) and [website](https://www.sinequa.com).

---

© Sinequa. Distributed under the terms of the [MIT license](license.txt).

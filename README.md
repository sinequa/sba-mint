# Sinequa Mint

A modern Angular 20+ application boilerplate for building scalable, maintainable, and Sinequa-integrated web apps.

---

## 📺 Introduction

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

## � Changelog

### Latest Changes (October 2025)

#### 🚀 New Features

##### UI Testing Framework (Experimental)

- **NEW**: Added comprehensive UI component testing page (`ui-tester.ts`)
  - Interactive testing for all UI components (buttons, cards, inputs, menus, etc.)
  - Real-time variant and state testing
  - Dark mode toggle testing

##### Dark Mode & Theme System

- **NEW**: Complete dark mode implementation
  - Added theme selection in user menu (Light/Dark/System)
  - Enhanced theme utilities with proper CSS variables
  - Dark mode support for all components and chat interfaces
  - Automatic system preference detection

##### Enhanced User Experience (Experimental)

- **NEW**: Added advanced search component to preview layout
- **NEW**: Extended preview layout with collapsible sidebar
- **NEW**: Enhanced preview component with better state management
- **NEW**: Improved autocomplete with async data fetching and error handling
- **NEW**: Added save confirmation notifications for searches

#### 🎨 UI/UX Improvements

##### Component Enhancements

- **IMPROVED**: Search component with better routing and event handling
- **IMPROVED**: Sidebar component with conditional AI chat visibility
- **IMPROVED**: User menu with comprehensive theme selection
- **IMPROVED**: Preview component with grid layout and better responsiveness
- **IMPROVED**: Collections component with improved validation and UX
- **IMPROVED**: Saved searches with better accessibility and styling

##### Accessibility & Localization

- **IMPROVED**: Enhanced ARIA labels and accessibility attributes
- **IMPROVED**: Comprehensive internationalization updates (EN/FR/DE)
- **IMPROVED**: Better keyboard navigation support
- **IMPROVED**: Improved screen reader compatibility

##### Visual Polish

- **IMPROVED**: Enhanced card hover states and selection feedback
- **IMPROVED**: Better scrollbar styling for dark mode
- **IMPROVED**: Improved spacing and typography consistency
- **IMPROVED**: Enhanced drawer and modal styling

#### 🛠️ Technical Improvements

##### Architecture & Performance

- **REFACTORED**: Autocomplete component to use async/await pattern
- **REFACTORED**: Signal-based state management across components
- **REFACTORED**: Improved error handling and user feedback
- **REFACTORED**: Better resource management in preview component

##### Build & Dependencies

- **UPDATED**: Package dependencies and build configuration
- **IMPROVED**: CSS organization with modular structure
- **IMPROVED**: Environment configuration management

##### Code Quality

- **IMPROVED**: Type safety and error handling
- **IMPROVED**: Component lifecycle management
- **IMPROVED**: Consistent coding patterns and practices

#### 🐛 Bug Fixes

##### Navigation & Routing

- **FIXED**: Assistant routing with proper query parameters
- **FIXED**: Search input focus and dropdown behavior
- **FIXED**: Preview navigation and state persistence

##### Component Issues

- **FIXED**: Dark mode toggle synchronization
- **FIXED**: Drawer state management across components
- **FIXED**: Form validation in collections component
- **FIXED**: Memory leaks in subscription management

##### Preview & Media

- **FIXED**: Preview zoom functionality and pagination
- **FIXED**: Document navigation and highlighting

#### 📱 Responsive Design

##### Layout Improvements

- **IMPROVED**: Search layout grid system for better responsiveness
- **IMPROVED**: Assistant layout with adaptive sidebar
- **IMPROVED**: Better mobile navigation and drawer behavior
- **IMPROVED**: Enhanced tablet and desktop layouts

#### 🌍 Internationalization

##### Language Support

- **ENHANCED**: German translations for new features
- **ENHANCED**: French translations with improved accuracy
- **ENHANCED**: English base translations
- **ADDED**: User menu theme selection translations
- **ADDED**: Assistant and preview feature translations

#### 📋 Configuration & Setup

##### Environment & Build

- **UPDATED**: Environment configuration for development
- **IMPROVED**: Build scripts and tooling
- **ENHANCED**: CSS preprocessing and organization

##### Styling System

- **REORGANIZED**: CSS override structure
- **IMPROVED**: Theme utilities and variables
- **ENHANCED**: Component-specific styling

---

**Summary**: This release represents a major enhancement to the SBA Mint application with significant improvements in user experience, accessibility, internationalization, and technical architecture. Over 50 files were modified with thousands of lines of improvements across the application.

---

## ️ Technical Stack

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

## 📞 Contact Us

Interested in Sinequa?  
Contact us by [email](mailto:info@sinequa.com) or visit our [contact page](https://www.sinequa.com/contact/) and [website](https://www.sinequa.com).

---

© Sinequa. Distributed under the terms of the [MIT license](license.txt).

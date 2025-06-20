---
title: Tokens
sidebar_position: 3
---

Mint can currently be configured in different ways: either through [JSON configuration](customization.mdx) from the
Sinequa administration interface, or by using parameters (injection tokens) within the application code.

This document focuses on the second method, which allows for more flexibility and customization in the application code.

## Angular Injection Tokens Table

In the following table, you will find the main Angular injection tokens used to configure the Mint application. Each token is described with its purpose.

| Injection Token              | Description                                                                                      |
|------------------------------|--------------------------------------------------------------------------------------------------|
| [LOCALE_ID](#locale_id)                    | Sets the locale for the application (e.g., `'fr-FR'`).                                          |
| [HIGHLIGHTS](#highlights)                   | Configures CSS classes for highlights in the preview.                                            |
| [COMPONENTS_FOR_DOCUMENT_TYPE](#components_for_document_type) | Returns the component to use for each document type in the preview.                             |
| [DRAWER_COMPONENT](#drawer_component)             | Specifies the component to use for the drawer UI.                                                |
| [RECENT_SEARCHES_CONFIG](#recent_searches_config)       | Configures the recent searches widget (path, options, "Load more" button).                      |
| [SAVED_SEARCHES_CONFIG](#saved_searches_config)        | Configures the saved searches widget (path, options, "Load more" button).                       |
| [BOOKMARKS_CONFIG](#bookmarks_config)             | Configures the bookmarks widget (path, options, "Load more" button).                            |
| [COLLECTIONS_CONFIG](#collections_config)           | Configures the collections widget (path, options, "Load more" button).                          |
| [PREVIEW_CONFIG](#preview_config)               | Configures how extracts are retrieved in the preview (e.g., web worker usage).                  |
| [ROUTE_COMPONENTS](#route_components)             | Maps routes to components for the application.                                                  |
| [AGGREGATIONS_NAMES](#aggregations_names)           | Adds specific aggregations to the filters bar (e.g., 'Money', 'Companies').                     |
| [FILTERS_BREAKPOINT](#filters_breakpoint)           | Sets how many filters are displayed before moving extras to the "More" button.                  |
| [APP_FEATURES](#app_features)                 | Configures specific application features (e.g., assistant options).                             |
| [FlowInjectionToken](#flowinjectiontoken)           | Used by the upload Assistant service to inject the Flow object.                                 |

## Angular Injection Tokens

Below are the main Angular injection tokens used to configure the Mint application. Each token is described in detail, including its function and the value defined in the `app.config.ts` file.

### LOCALE_ID

Sets the locale for the application, such as `'fr-FR'`, to localize dates, numbers, and other locale-sensitive data.

**Value:** `'fr-FR'`

---

### HIGHLIGHTS

Configures the CSS classes used for highlights in the preview. Each highlight will have a corresponding CSS class.

**Value:** `PREVIEW_HIGHLIGHTS`

---

### COMPONENTS_FOR_DOCUMENT_TYPE

Provides a function that returns the component to use for each document type in the preview.

**Value:** `getComponentsForDocumentType`

---

### DRAWER_COMPONENT

Specifies the component to use for the drawer UI in the application.

**Value:** `DrawerPreviewComponent`

---

### RECENT_SEARCHES_CONFIG

Configures the recent searches widget, including its path, options, and whether to show the "Load more" button.

**Value:**  

```ts
{ 
  ...RECENT_SEARCHES_OPTIONS, 
  routerLink: '/widgets/recent-searches',
  showLoadMore: false 
}
```

---

### SAVED_SEARCHES_CONFIG

Configures the saved searches widget, including its path, options, and "Load more" button visibility.

**Value:**  

```ts
{ 
  ...SAVED_SEARCHES_OPTIONS, 
  routerLink: '/widgets/saved-searches',
  showLoadMore: false 
}
```

---

### BOOKMARKS_CONFIG

Configures the bookmarks widget, including its path, options, and "Load more" button visibility.

**Value:**  

```ts
{ 
  ...BOOKMARKS_OPTIONS, 
  routerLink: '/widgets/bookmarks',
  showLoadMore: false 
}
```

---

### COLLECTIONS_CONFIG

Configures the collections widget, including its path, options, and "Load more" button visibility.

**Value:**  

```ts
{ 
  ...COLLECTIONS_OPTIONS, 
  routerLink: '/widgets/collections',
  showLoadMore: false 
}
```

---

### PREVIEW_CONFIG

Configures how extracts are retrieved in the preview, such as enabling or disabling the use of a web worker.

**Value:**  

```ts
{ allowWorker: true }
```

---

### ROUTE_COMPONENTS

Provides the mapping of routes to components for the application, allowing customization of which component is used for each route.

**Value:**  

```ts
[
  { path: 'search', component: SearchLayoutComponent, isRoot: true },
  { path: 'all', component: SearchAllComponent }
]
```

---

### AGGREGATIONS_NAMES

(Disabled by default) Used to add specific aggregations to the filters bar, such as 'Money', 'Companies', etc.

**Value:**  

```ts
['Money', 'Companies', ...AGGREGATIONS_NAMES_PRESET_DEFAULT]
```

---

### FILTERS_BREAKPOINT

Sets how many filters are displayed in the filter bar before extra filters are moved to the "More" button.

**Value:** `10`

---

### APP_FEATURES

Configures specific application features, such as assistant options.

**Value:**  

```ts
{ assistant: { usePrefixName: false } }
```

---

### FlowInjectionToken

Used by the upload Assistant service to inject the Flow object. If you do not use the Assistant, you can comment out this line.

**Value:** `Flow`

## Example of app.config.ts file

The following is an example of an `app.config.ts` file that configures the Mint application using the Angular injection tokens mentioned above. This file is typically located in the root of your Angular application.

```ts
export const appConfig: ApplicationConfig = {
  providers: [

    // this function is used to sign in the user and bootstrap the application
    provideAppInitializer(() => bootstrapApp(inject(Router), inject(ApplicationService), { createRoutes: true })),

    { provide: LOCALE_ID, useValue: 'fr-FR' },

    // this token is used to configure the CSS class to use in the preview with the highlights
    // for each highlight, a CSS class will be created with the name of the highlight
    { provide: HIGHLIGHTS, useValue: PREVIEW_HIGHLIGHTS },

    // this token is used to configure the function who returns the component to use for the preview
    // the function should return a DocumentTypeMap object
    { provide: COMPONENTS_FOR_DOCUMENT_TYPE, useValue: getComponentsForDocumentType },

    // this token is used to configure the component to use with the drawer
    { provide: DRAWER_COMPONENT, useValue: DrawerPreviewComponent },

    // those tokens are used to configure the path of the widgets
    // by default, the routerLink is "/xxx", where xxx is the name of the widget
    // if you want to change the path of the widget, you can use the routerLink property
    // showLoadMore is used to show the "Load more" button in the widgets, by default it is set to true, 
    // so here we set it to false
    { provide: RECENT_SEARCHES_CONFIG, useValue: 
      { 
        ...RECENT_SEARCHES_OPTIONS, 
        routerLink: '/widgets/recent-searches',
        showLoadMore: false
      }
    },
    { provide: SAVED_SEARCHES_CONFIG, useValue: 
      { 
        ...SAVED_SEARCHES_OPTIONS, 
        routerLink: '/widgets/saved-searches',
        showLoadMore: false
      } 
    },
    { provide: BOOKMARKS_CONFIG, useValue: 
      { 
        ...BOOKMARKS_OPTIONS, 
        routerLink: '/widgets/bookmarks',
        showLoadMore: false
      } 
    },
    { provide: COLLECTIONS_CONFIG, useValue: 
      { 
        ...COLLECTIONS_OPTIONS, 
        routerLink: '/widgets/collections',
        showLoadMore: false
      } 
    },
    // this token is used to configure how the extracts will be retrieved
    // if worker is allowed by your Security Policy, the extracts will be retrieved using a web worker
    // if not, comment the line below or set it to false
    { provide: PREVIEW_CONFIG, useValue: { allowWorker: true } },

    // this token is used to configure the component to use for each path,
    // use it, if you want to use a different component for the same path
    {
      provide: ROUTE_COMPONENTS,
      useValue: [
        {
          path: 'search',
          component: SearchLayoutComponent,
          isRoot: true
        },
        {
          path: 'all',
          component: SearchAllComponent
        }
      ]
    },

    // this token is used to add specific aggregations to the filters bar
    // in the case of the example, we add the Money aggregation when available
    // in the search result
    // { provide: AGGREGATIONS_NAMES, useValue: ['Money', 'Companies', ...AGGREGATIONS_NAMES_PRESET_DEFAULT] },

    // this token is use to configure how many filters are displayed in the filter bar before to be moved to the "More" button
    // in the case of the example, we set the number of filters to 10, so if we have 15 filters, 10 will be displayed in the 
    // filter bar and 5 will be moved to the "More" button
    // if the space is not enough, the filters will be moved to the "More" button
    { provide: FILTERS_BREAKPOINT, useValue: 10 },

    // this token is used to configure specific configuration within the application
    { provide: APP_FEATURES, useValue: { assistant: { usePrefixName: false } } },

    // used by the upload Assistant service
    { provide: FlowInjectionToken, useValue: Flow },

  ]
};
```

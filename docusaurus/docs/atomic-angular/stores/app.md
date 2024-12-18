---
title: App
---

## Overview

Contains all the `CCApp` informations

## Computed values

### customizationJson

Get the customization json object

:::info
By default the custom json is empty
:::

#### Usage
```ts
const json = inject(AppStore).customizationJson;
// Output: {}
```


### sources

Get the sources's customizations object.  
_This configuration is pre-configured in Sinequa 11.12+._

:::caution
Available only in Sinequa 11.12+
:::

<details>
  <summary>Sources configuration extract</summary>
```json
{
  "sources": {
    "collection": {
        "/test/legifrance/": {
            "iconClass": "fa-kit fa-legifrance"
        },
        "/web/wiki2/": {
            "iconClass": "fas fa-box-archive"
        }
    },
    "source": {
        "sinequa": {
            "iconClass": "fa-kit fa-sinequa"
        },
        "web": {
            "iconClass": "fab fa-chrome"
        }
    },
    "connector": {
        "confluence.v6.rest": {
            "iconClass": "fa-brands fa-confluence"
        },
        "confluence.v7.rest": {
            "iconPath": "/r/confluence.png"
        },
        "crawler2": {
            "iconClass": "fas fa-champagne-glasses"
        }
    }
  }
}
```
</details>

#### Usage
```ts
const json = inject(AppStore).sources;
```

### filters

Get the filters's configuration object.

:::caution
Available only in Sinequa 11.12+
:::

```json
{
  "filters": [ 
      { "column": "geo", "icon": "fa-solid fa-earth-europe", "hidden": false }
  ]
}
```

#### Usage
```ts
const json = inject(AppStore).filters;
```

## Basic features

### initialize()

Initializes the application state by fetching the app data from the appService
and updating the store with the retrieved data.

```ts	
initialize(): void
```

:::warning
This method must be called just after the login step because you need to be authenticated first.
:::

### update()

Updates the application state with the provided `CCApp` object.
  
  ```ts
  update(app: CCApp): void
  ```
  
  | parameter | type  | description                          |
  |-----------|-------|--------------------------------------|
  | app       | CCApp | The new `CCApp` object to update the state with. |
  

## Web Services features
### getWebServiceByType()

Returns the web service object if found, otherwise `undefined`.

```ts
getWebServiceByType(type: CCWebService['webServiceType']): CCWebService | undefined
```


| parameter    | type           | description                                      |
|--------------|----------------|--------------------------------------------------|
| type | `CCWebService['webServiceType']`  | Web service type name.   |

:::info
`CCWebService['webServiceType']` is as special type to allow autocomplete.

Value can be `'Autocomplete'` | `'DataSets'` | `'Labels'` | `'Preview'` | `'Query'` | `'queryexport'` | `'sponsoredlinks'`
:::

#### Usage
```ts title="some-component.ts"
@Component({ ... })
export class SomeComponent {

  const preview = inject(AppStore).getWebServiceByType('Preview');
}
```

## Labels features
### getLabels()

Retrieves the private and public labels from the web service.

Returns An object `{ private: string, public: string }` containing the private and public labels.  
If the labels are not found, returns an object with empty strings for both fields.

```ts	
getLabels(): { private: string, public: string }
```


#### Usage
```ts title="some-component.ts"
@Component({ ... })
export class SomeComponent {

  labels = inject(AppStore).getLabels();
  // { private: '...', public: '...'}
}
```

## Queries features
### getQueryByName()

Retrieves a query by its name from the store.

Returns The `CCQuery` object if found, otherwise `undefined`.

```ts	
getQueryByName(name: string): CCQuery | undefined
```

| parameter    | type           | description                                      |
|--------------|----------------|--------------------------------------------------|
| name | string  | The name of the query to retrieve.   |

#### Usage
```ts title="some-component.ts"
@Component({ ... })
export class SomeComponent {

  query: CCQuery = inject(AppStore).getQueryByName('_query');
}
```

### getQueryByIndex()

Retrieves a query by its index from the store.

Returns The query object if found, otherwise `undefined`.

```ts
getQueryByIndex(index: number): CCQuery | undefined
```

| parameter    | type           | description                                      |
|--------------|----------------|--------------------------------------------------|
| index | number  | The index of the query to retrieve.   |

#### Usage
```ts title="some-component.ts"
@Component({ ... })
export class SomeComponent {

  query: CCQuery = inject(AppStore).getQueryByIndex(0);
  // returns the default query set in the Sinequa administration
}
```

### getDefaultQuery()

Retrieves the default query.  

Returns the default `CCQuery` if it exists, otherwise undefined.

```ts
getDefaultQuery(): CCQuery | undefined
```

:::important
The default query is __always__ the first query in the list of queries.
:::


#### Usage
```ts title="some-component.ts"
@Component({ ... })
export class SomeComponent {
  
  query: CCQuery = inject(AppStore).getDefaultQuery();
  // returns the default query set in the Sinequa administration
}
```
:::tip
This is a convenient way instead of [`getQueryNameByIndex(0)`](#getquerybyindex)
:::

### allowEmptySearch()

Retrieves the allowEmptySearch flag for a specific query.

Returns The allowEmptySearch value for the specified query, or false if not found.

```ts	
allowEmptySearch(queryName: string): boolean
```

| parameter  | type   | description                                                        |
|------------|--------|--------------------------------------------------------------------|
| queryName  | string | The name of the query for which to retrieve allow empty search flag. |

#### Usage
```ts title="some-component.ts"
@Component({ ... })
export class SomeComponent {
  
  allowEmptySearch: boolean = inject(AppStore).allowEmptySearch('_query');
  // returns true or false depending the flag set in Sinequa Administration
}
```

### getNamedCustomizationJson()

Retrieves the customization json by name

Returns The customization json object or undefined if not found

:::caution
Available only in Sinequa 11.12+
:::
  
  ```ts
  getNamedCustomizationJson(name: string): any
  ```


| parameter  | type   | description |
|------------|--------|-------------|
| name  | string | The name of the customization json. |

#### Usage
```ts
const json = inject(AppStore).getNamedCustomizationJson("routes");
```

## Aggregations features
### getAggregationIcon()

Retrieves the icon associated with a given column's aggregation.

Returns the icon value associated with the specified column's aggregation, or undefined if no matching aggregation is found.

```ts	
getAggregationIcon(column: string): string | undefined
```

| parameter  | type   | description |
|------------|--------|-------------|
| column  | string | The name of the column for which to retrieve the aggregation icon. |


```ts title="get-aggregation-icon.ts"
// json Aggregation configuration extract
{
  aggregations: [
    { 
      column: "geo", 
      icon?: "fas fa-globe",
      display?: "Places", 
      hidden?: false, 
      items?: [{ value: "Madrid", icon?: "fas fa-map" }]
    }
  ]
}

const icon = inject(AppStore).getAggregationIcon("geo");
// Output: "fas fa-globe"
```

### getAggregationItemsCustomization()

Retrieves the customization items for a given column from the store's filters.  

Returns An array of `CFilterItem` objects if found, otherwise `undefined`.

```ts	
getAggregationItemsCustomization(column: string): CFilterItem[] | undefined
```

| parameter  | type   | description |
|------------|--------|-------------|
| column  | string | The name of the column for which to retrieve the aggregation icon. |

```ts title="get-aggregation-items-customization.ts"
// json Aggregation configuration extract
{
  aggregations: [
    { 
      column: "geo", 
      icon?: "fas fa-globe",
      display?: "Places", 
      hidden?: false, 
      items?: [{ value: "Madrid", icon?: "fas fa-map" }]
    }
  ]
}

const items = inject(AppStore).getAggregationItemsCustomization("geo");
// Output: [{ value: "Madrid", icon: "fas fa-map" }]
```

### getAggregationCustomization()

Retrieves the customization for a specific aggregation column.

Returns The customization object for the specified column, or undefined if not found.

```ts	
getAggregationCustomization(column: string): Aggregation | undefined
```

| parameter  | type   | description |
|------------|--------|-------------|
| column  | string | he column name for which to retrieve the customization. |

```ts title="get-aggregation-customization"
// json Aggregation configuration extract
{
  aggregations: [
    { 
      column: "geo", 
      icon?: "fas fa-globe",
      display?: "Places", 
      hidden?: false, 
      items?: [{ value: "Madrid", icon?: "fas fa-map" }]
    }
  ]
}

const conf = inject(AppStore).getAggregationCustomization("geo");
// Output:
{ 
  column: "geo", 
  icon?: "fas fa-globe",
  display?: "Places", 
  hidden?: false, 
  items?: [{ value: "Madrid", icon?: "fas fa-map" }]
}
```

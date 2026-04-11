---
title: Types Table
sidebar_class_name: update
---

Complete reference of all exported types and enums.

## Aggregations

| Type | Description |
|------|-------------|
| `Aggregation` | Base aggregation type. Describes results of an aggregation. |
| `AggregationItem` | Base aggregation item. Shared by list and tree nodes. |
| `AggregationOptions` | Options for paginating aggregation values. |
| `ListAggregation` | Fields specific to a list aggregation. |
| `TreeAggregation` | Fields specific to a tree aggregation. |
| `TreeAggregationNode` | A node in a tree aggregation, extends `AggregationItem`. |

## Audit

| Type | Description |
|------|-------------|
| `AuditEvent` | A single audit event with a type, detail, and optional RFM detail. |
| `AuditEvents` | Composite type: `AuditEvent`, `AuditEvent[]`, or `AuditRecord`. |
| `AuditEventType` | Enum of all standard audit event type strings. |
| `AuditEventTypeValues` | String union of all `AuditEventType` values. |
| `AuditRecord` | Container with `auditEvents` and `mlAuditEvents` arrays. |

## Authentication

| Type | Description |
|------|-------------|
| `Credentials` | Username and password credentials. |

## Configuration

| Type | Description |
|------|-------------|
| `AppGlobalConfig` | Global application configuration type. |
| `CCApp` | Full application configuration object. |
| `CCAppPreLogin` | Pre-login application configuration (available before auth). |
| `CCAppRefresh` | Object returned by `AppWebService.refresh`. |
| `CCAutocomplete` | Autocomplete web service configuration. |
| `CCColumn` | Column configuration in an index. |
| `CCColumnInfo` | Configuration parameters for a column. |
| `CCColumnsInfo` | Map of column configurations. |
| `CCConfig` | Base fields available in all configuration objects. |
| `CCIndex` | Index configuration object. |
| `CCLabels` | Labels web service configuration. |
| `CCList` | List configuration object. |
| `CCListItem` | List item configuration object. |
| `CCQuery` | Query configuration object. |
| `CCRFM` | RFM configuration object. |
| `CCRFMAction` | RFM action configuration object. |
| `CCScope` | Scope configuration for query filtering. |
| `CCSortingChoice` | Sorting choice for queries. |
| `CCTab` | Tab configuration object. |
| `CCTabSearch` | Tab search configuration in a query. |
| `CCWebService` | Web service configuration object. |
| `EngineType` | Search engine type enum. |
| `EngineTypeModifier` | Modifier for engine type. |
| `QueryPrecision` | Precision operators for text search. |
| `QueryStrategy` | Strategies for query search parameters. |
| `SpellingCorrectionMode` | Modes for spelling correction in search. |

## Export

| Type | Description |
|------|-------------|
| `ExportDialogModel` | Deprecated export dialog model. |
| `ExportOutputFormat` | Output format for export (`Csv`, `Xlsx`, etc.). |
| `ExportQueryModel` | Data model for an export request. |
| `ExportSourceType` | Source type for export (`Result`, `Selection`, etc.). |

## Filters

| Type | Description |
|------|-------------|
| `BetweenFilter` | Filter for `between` operator. |
| `ExprFilter` | Filter for expression operators (`and`/`or`/`not`). |
| `Filter` | Generic filter object. |
| `FilterExprOperator` | Expression filter operators (`and`/`or`/`not`). |
| `FilterOperator` | All filter operators. |
| `FilterRangeOperator` | Range filter operators (`in`/`between`). |
| `FilterScalarOperator` | Scalar filter operators (`eq`, `neq`, `gt`, etc.). |
| `InFilter` | Filter for `in` operator. |
| `LegacyFilter` | Legacy filter object (URL-based). |
| `NotNullFilter` | Filter for `notnull` operator. |
| `NullFilter` | Filter for `null` operator. |
| `SimpleFilter` | Filter for scalar operators. |

## Labels

| Type | Description |
|------|-------------|
| `LabelsRights` | User rights for managing/editing labels. |

## Notifications

| Type | Description |
|------|-------------|
| `NotificationAction` | Clickable action attached to a notification. |
| `NotificationEvent` | A notification dispatched by the `notify` object. |
| `NotificationsEventOptions` | Options for duration, description, close button, and action. |

## Preview

| Type | Description |
|------|-------------|
| `CategoryHighlightData` | Highlight data for a single category. |
| `CustomHighlights` | Custom highlight data for a category. |
| `HighlightDataPerCategory` | Highlight data for a set of categories. |
| `HighlightDataPerLocation` | Highlight data for a set of locations. |
| `HighlightValue` | A single highlight value. |
| `Location` | A single highlight location. |
| `PreviewData` | Data returned by `PreviewWebService.get`. |

## Queries & Results

| Type | Description |
|------|-------------|
| `API_ENDPOINTS` | API endpoint string type with autocomplete. |
| `Open` | Object to request children of a tree aggregation node. |
| `Query` | Query object for `QueryWebService`. |
| `QueryIntentAction` | A query intent action. |
| `QueryIntentDatasets` | Set of query intent datasets. |
| `QueryIntentEntity` | A query intent entity. |
| `QueryIntentMatch` | A query intent match result. |
| `QueryIntentResponse` | Full query intent response. |
| `QueryIntentWord` | A query intent word. |
| `RelevantExtract` | A relevant extract for a query. |
| `Result` | Full result of a query web service call. |
| `RFMActionDisplay` | Fields of an RFM action. |
| `RFMData` | RFM data returned with results. |
| `RFMDisplay` | Enum for RFM display kinds. |
| `Select` | Object to filter a query by facet selection. |
| `Suggestion` | Suggestion returned by suggest web services. |
| `Tab` | Results for a particular tab. |
| `TermPresence` | Term presence for a search term. |
| `TopPassage` | A top passage in a result. |
| `Article` | A single document record in search results. |

## Sponsored Links

| Type | Description |
|------|-------------|
| `LinkResult` | A single sponsored link result. |
| `LinksResults` | A set of sponsored links. |

## Text Chunks

| Type | Description |
|------|-------------|
| `TextChunk` | Text chunk with offset, length, and highlighted HTML. |
| `TextLocation` | Location and length within a document. |

## User Profile (v2)

| Type | Description |
|------|-------------|
| `UserProfile` | Full user profile with data, customData, timestamps. |
| `UserProfileData` | Static user profile fields (id, mail, fullName, etc.). |

## Security (v2)

| Type | Description |
|------|-------------|
| `ChangePasswordResponse` | Response from the change password endpoint. |
| `PasswordResetEmailResponse` | Response from the password reset email endpoint. |
| `VersionResponse` | Server version and feature flags. |

## User Settings

| Type | Description |
|------|-------------|
| `StringWithAutocomplete` | String type with autocomplete support. |
| `UserSettings` | Minimal built-in user settings, extensible. |
| `UserSettingsKeys` | Keys of the built-in user settings. |

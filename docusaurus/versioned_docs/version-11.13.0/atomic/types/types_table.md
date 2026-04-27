# Types Table

| Type Name | Description |
|-----------|-------------|
| Aggregation | Describes the results of an aggregation, base for list and tree aggregations |
| AggregationItem | Describes an aggregation item, base for list and tree aggregation nodes |
| AggregationOptions | Options for pagination of aggregation values |
| ListAggregation | Fields specific to a list aggregation |
| TreeAggregation | Fields specific to a tree aggregation |
| TreeAggregationNode | Node in a tree aggregation, extends AggregationItem |
| API_ENDPOINTS | API endpoint string type with autocomplete |
| Credentials | Username and password credentials |
| AuditEvent | Describes a single audit event |
| AuditEvents | Composite type for a set of audit events |
| AuditEventType | Enum of standard audit event types |
| AuditRecord | Contains an array of audit events and ML audit event records |
| TextChunk | Text chunk with offset, length, and HTML-highlighted text |
| TextLocation | Location and length in a document |
| CCConfig | Fields available in all configuration objects |
| CCApp | Application configuration object |
| CCAppPreLogin | Pre-login application configuration |
| CCAppRefresh | Object returned by AppWebService.refresh |
| CCAutocomplete | Autocomplete web service configuration |
| CCColumn | Column configuration in an index |
| CCColumnInfo | Configuration parameters for a column |
| CCIndex | Index configuration object |
| CCLabels | Labels web service configuration |
| CCList | List configuration object |
| CCListItem | List item configuration object |
| CCQuery | Query configuration object |
| CCRFM | RFM configuration object |
| CCRFMAction | RFM action configuration object |
| CCScope | Scope configuration object for query filtering |
| CCSortingChoice | Sorting choice for queries |
| CCTab | Tab configuration object |
| CCTabSearch | Tab search configuration in a query |
| CCWebService | Web service configuration object |
| QueryPrecision | Precision operators for text search |
| QueryStrategy | Strategies for query search parameters |
| SpellingCorrectionMode | Modes for spelling correction in search |
| BetweenFilter | Filter for between operator |
| ExprFilter | Filter for expression operators (and/or/not) |
| Filter | Generic filter object |
| FilterExprOperator | Expression filter operators (and/or/not) |
| FilterOperator | All filter operators |
| FilterRangeOperator | Range filter operators (in/between) |
| FilterScalarOperator | Scalar filter operators (eq, neq, gt, etc.) |
| InFilter | Filter for 'in' operator |
| NotNullFilter | Filter for 'notnull' operator |
| NullFilter | Filter for 'null' operator |
| SimpleFilter | Filter for scalar operators |
| LegacyFilter | Legacy filter object |
| Query | Query object for QueryWebService |
| Open | Object to request children of a tree node in aggregation |
| Select | Object to filter a query by facet selection |
| LinkResult | Single sponsored link result |
| LinksResults | Set of sponsored links |
| ExportOutputFormat | Output format for export (Csv, Xlsx, etc.) |
| ExportSourceType | Source type for export (Result, Selection, etc.) |
| ExportQueryModel | Data model for export dialog |
| ExportDialogModel | Deprecated export dialog model |
| LabelsRights | Rights for managing/editing labels |
| CategoryHighlightData | Highlight data for a category |
| CustomHighlights | Custom highlight data for a category |
| HighlightDataPerCategory | Highlight data for a set of categories |
| HighlightDataPerLocation | Highlight data for a set of locations |
| HighlightValue | Single highlight value |
| PreviewData | Data returned by PreviewWebService.get |
| Location | Single highlight location |
| Result | Results of a query web service call |
| RelevantExtract | Relevant extract for a query |
| QueryIntent | Single query intent item |
| QueryIntentAction | Query intent action |
| QueryIntentEntity | Query intent entity |
| QueryIntentWord | Query intent word |
| QueryIntentDatasets | Set of query intent datasets |
| QueryIntentMatch | Query intent match |
| QueryIntentResponse | Query intent response |
| TopPassage | Top passage in a result |
| Tab | Results for a particular tab |
| TermPresence | Term presence for a search term |
| RFMDisplay | Enum for RFM display kinds |
| RFMData | RFM data returned with results |
| RFMActionDisplay | Fields of an RFM action |
| Suggestion | Suggestion from suggest web services |
| UserSettings | Minimal built-in user settings, extensible |
| StringWithAutocomplete | String type with autocomplete support |
| UserSettingsKeys | Keys of user settings |

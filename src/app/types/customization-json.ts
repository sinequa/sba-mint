// TODO vvv Remove those temporary objects vvv
export type Customization = CustomizationJson & {
  aggregations?: AggregationCustomization[];
}

export type AggregationCustomization = {
  column: string;
  label?: string;
  iconClass?: string;
  items?: AggregationItemCustomization[];
}

export type AggregationItemCustomization = {
  value: string;
  iconClass?: string;
}
// TODO ^^^ Remove those temporary objects ^^^

export type UserFeatures = {
  recentSearches?: boolean;
  savedSearches?: boolean;
  bookmarks?: boolean;
}

export type Features = {
  applications?: boolean;
}

// Main configuration object
export type CustomizationJson = {
  userFeatures?: UserFeatures;
  features?: Features;

  //   previewMetadata?: PreviewMetadata;
  //   application?: Application;
  //   assistant?: Assistant;
  //   aggregations?: Aggregation[];
  //   contentFeatures?: ContentFeature[];
  //   facets?: Facet[];
  //   globalFeatures?: GlobalFeature[];
  //   hack?: HackFeatures;
  //   preview: Preview;
  //   previewFeatures?: PreviewFeature[];
  //   searchBarFeatures?: SearchBarFeature[];
  //   searchFeatures?: SearchFeature[];
  //   searchResultsFeatures?: SearchResultsFeature[];
  //   sourcesMetadata?: SourceMetadata[];
  //   sourcesResultFilterMetadata?: SourceResultFilterMetadata[];
  //   supportFeatures?: SupportFeature;
  //   userMenuFeatures?: UserMenuFeature[];
  //   neuralFeatures?: NeuralFeature;
  //   customizedLabels?: Map<string, Map<string, string>>;
  //   bankerPreviewMetadataToDisplay?: BankerPreviewMetadataToDisplay[];
  //   dealsPreviewMetadataToDisplay?: DealsPreviewMetadataToDisplay[];
  //   documentPreviewMetadataToDisplay?: DocumentPreviewMetadataToDisplay[];
}

// export type FeatureName =
//   | 'savedQueries'
//   | 'favorites'
//   | 'recentWorks'
//   | 'businessApplications'
//   | 'notifications'
//   | 'feedback'
//   | 'summarize'
//   | 'sharedQueries';

// export type Application = {
//   allowDocumentSubscription: boolean; //              should manual document subscription be allowed?
//   appName: string; //                                 name of the application (home.pageTitle if left empty)
//   contentDeduplication: boolean; //                   should content deduplication be enabled?
//   defaultFilters: FilterFeature[]; //                 list of default filter to apply by tab
//   enableChat: boolean; //                             should chat be enabled?
//   enabledFeatures: FeatureName[]; //                  list of enabled features
//   excludedFacetFilterNames: string[]; //              list of facet filter names to exclude from badges
//   excludedFieldFilters: string[]; //                  list of facet filter names to exclude from badges
//   keepFiltersAcrossTab: boolean; //                   should filters be kept when changing tab?
//   logoHeight?: {
//     home?: string; //                                 logo to use on home page
//     navbar?: string; //                               logo to use on navbar
//   };
//   mergeFacetFiltersIntoBadges: boolean; //            should facet filters be merged into badges?
//   queryDeduplication: boolean; //                     should query deduplication be enabled?
//   // queryFeedback: QueryFeedback; //                    query feedback configuration
//   showProductTour: boolean; //                        should product tour be shown?
//   showMissingTerms: boolean;
//   showQueryFeedback: boolean; //                      should query feedback be shown?
//   subscribeDocumentOnPin: boolean; //                 should document be subscribed when pinned?
//   unsubscribeDocumentOnUnpin: boolean; //             should document be unsubscribed when unpinned?
//   queryRouters?: QueryRouter[]; //                    list of query routers
//   dateFormat: string;
// }

// export type AssistantMode = 'passages' | 'record';

// export type QueryRouter = {
//   route: string; //      route to use for this query
//   queryName: string; //  query name to use for this route
// };

// export type AssistantModeConfiguration = {
//   mode: AssistantMode; //               name of the mode
//   startCollapsed?: boolean; //          should assistant be collapsed by default?
//   prompt?: string; //                   prompt to use for assistant
// };

// export type Assistant = {
//   config: {
//     model?: string; //                        model to use for assistant
//     temperature?: number; //                  temperature to use for assistant
//   };
//   modes: AssistantModeConfiguration[]; //     list of assistant modes
//   showFeedback: boolean; //                   should feedback options be shown?
//   showLoadingText: boolean; //                should loading text be shown?
// }

// export type FilterFeature = {
//   name: string | string[]; //       tab affected by the default filter option
//   timeline: TimeRangeOffset; //     time range to offset from now
// }

// export type TimeRangeOffset = {
//   from: number; //      beginning of the time range
// }

// export type Aggregation = {
//   treepath: string; //                      treepath of the current aggregation
//   path: string; //                          path to source logo static file,
//   // iconPrefix?: IconPrefix; //               icon prefix to use for this aggregation
//   // iconName?: IconName; //                   icon to use for this aggregation
//   parentFolder?: ParentFolderOverride; //   parent folder override
//   queryDeduplication?: {
//     show: boolean; //                       should show query deduplicated document?
//     column: string; //                      column to use for query deduplication
//   };
//   attachments?: {
//     show: boolean; //                       should show attachments?
//     column: string; //                      column to use for attachments
//   };
// }

// export type ParentFolderOverride = {
//   text?: string; //     text override for this treepath parent folder
//   // icon?: IconName; //   icon override for this treepath parent folder
// };

// export type SecondaryAction = {
//   action: string; //    action to perform on click
//   title: string; //     title of the action
//   data: string; //      key of suggestion metadata to show as placeholder of the button
// };

// export type PositionalFeature = {
//   name?: string; //                                 name of the feature if not defined by the parent
//   order?: number; //                                in which order should it be rendered?
//   count?: number; //                                if applicable, how much element should be rendered?
//   type?: 'card' | 'dropdown' | 'link'; //           if applicable, should this feature be rendered as card, dropdown or link?
//   url?: string; //                                  if applicable, internal url to redirect the user
//   iconType?: 'class' | 'treepath' | 'initials'; //  if applicable, type of icon to render
//   iconClass?: string; //                            if applicable, class of the icon to render
//   title?: string; //                                if applicable, title of the feature
//   showTitle?: boolean; //                           if applicable, should the title be shown?
//   secondaryAction?: SecondaryAction; //             if applicable, secondary action to show
// }

// export type GlobalFeature = {
//   name: FeatureName; // names of available global features
//   icon?: string; //                 icon to render for this feature
//   navbar?: PositionalFeature; //    options for navbar positioning
//   homepage?: PositionalFeature; //  options for homepage positioning
// }

// export type SavedQueryFeature = GlobalFeature & {
//   name: 'savedQueries'; //   forces name to actual feature
//   // sharedQueriesEnabled?: boolean; //  should shared query be enabled?
// }

// export type Preview = {
//   showHighlightActions: boolean; //   should highlight actions be shown?
// }

// export type PreviewFeatureName = 'people';

// export type PreviewFeature = {
//   name: PreviewFeatureName | PreviewFeatureName[]; //     name of the preview component
//   options?: PreviewOption[]; //                           preview options
// }

// export type PreviewOptionName = 'biography' | 'instantMessaging' | 'recentWork' | 'relatedTo';

// export type PreviewOption = {
//   name: PreviewOptionName; //           name of the option
// }

// export type InstantMessagingOptions = PreviewOption & {
//   name: 'instantMessaging';
//   // iconProp: IconProp;
// }

// export type RecentWorkOptions = PreviewOption & {
//   name: 'recentWork'; //            name of the option
//   count: number; //                 number of recent work to show
// };

// export type RelatedToOptions = PreviewOption & {
//   name: 'relatedTo'; //             name of the option
//   count: number; //                 number of records to show
// };

// export type SearchResultOptions = {
//   name: string; //                                    name of the option
//   count?: number; //                                  related count of the option
//   showAttachments?: boolean; //                       should attachments be shown?
//   showDuplicates?: boolean; //                        should duplicates be shown?
// }

// export type SearchResultsFeature = {
//   name: string | string[]; //           name of search result page
//   layout: 'list' | 'grid'; //           layout to display each result
//   options?: SearchResultOptions[]; //   card intel to toggle
// }

// export type BusinessApplications = GlobalFeature & {
//   name: 'businessApplications'; //          forces name to actual feature
//   applications: ExternalApplication[]; //   application to render
// }

// export type ExternalApplication = {
//   name: string; //      name of the application
//   logo: string; //      path to application logo static file
//   url: string; //       redirection url used when application is selected
//   tooltip?: string; //  message to show in tooltip
// }

// export type RelatedSearchFeature = SearchFeature & {
//   name: 'relatedSearches'; //   forces name to actual feature
//   count: number; //             number of related search
//   queries: string[]; //         query names to use for suggestions
// }

// export type SearchFeature = {
//   name: 'relatedSearches'; //   names of available search related features
//   count?: number; //            if applicable, how much element should be rendered?
// }

// export type SearchBarFeature = {
//   name: 'autocomplete'; //          names of available search bar related features
//   options: PositionalFeature[]; //  list of features inside the autocomplete
// }

// export type Facet = {
//   name: string; //              name of the facet
//   display: string; //           display to show as title
//   icon: string; //              icon class to use
//   tabs: string[]; //            list of tab in which this facet should appear
//   title?: string; //            facet title
//   collapsible?: boolean; //     can the facet be collapsed?
//   startCollapsed?: boolean; //  should facet be collapsed by default?
//   searchable?: boolean; //      show action to toggle search bar?
//   showCount?: boolean; //       show count of each value?
//   maxCount?: boolean; //        number of element before "show more"
//   order?: number; //            order
//   showCheckbox?: boolean; //    should facets show checkbox?
//   forceMaxHeight?: boolean; //  should facet be force to its max height?
//   expandedLevel?: number; //    default expanded level
//   allowExclude?: boolean; //    allow exclusion?
//   allowOr?: boolean; //         allow inclusion?
//   allowAnd?: boolean; //        allow combination?
// }

// export type WPSResultMetadataConfig = {
//   column: string;
//   color: string;
//   // icon?: IconName;
//   inline?: boolean;
// }

// export type ContentFeature = {
//   name: 'labels' | 'download' | 'similarDocuments' | 'enrichments'; //  names of available content related features
//   options?: string[]; //                                content feature options
// }

// export type SourceMetadata = {
//   names: string[]; //     names of sources matching backend configuration
//   metadata: string[]; //  names of backend columns matching metadata to show up
// }

// export type FlatSourceMetadata = {
//   name: string; //        name of sources matching backend configuration
//   metadata: string[]; //  names of backend columns matching metadata to show up
// }

// export type SourceResultFilterMetadata = {
//   names: string[]; // names of sources matching backend configuration
//   metadata: WPSResultMetadataConfig[]; // sq-metadata configuration values
// }

// export type FlatSourceResultFilterMetadata = {
//   name: string; // name of source matching backend configuration
//   metadata: WPSResultMetadataConfig[]; //
// }

// export type SupportFeature = {
//   email: string; //                                     support email address
//   // configuration for support page
//   supportPage: {
//     videos?: Asset[]; //                                video to show inside the carrousel
//   };
//   faqs?: { question: string; answer: string }[]; //     set of question and answer
// }

// export type Asset = {
//   title: string; //     title of the asset
//   path: string; //      path from /assets
//   iconPath?: string; // icon to show next to the title
// }

// export type NeuralFeature = {
//   answers?: AnswersFeatures; //   answers tab features
// }

// export type AnswersFeatures = {
//   chat?: ChatFeatures; //   chat related features
// }

// export type ChatFeatures = {
//   suggestions?: string[]; //  suggestions to show above the input text
// }

// export type PreviewMetadata = {
//   documents: {
//     recordMetadata: any;
//     enrichments: string[];
//   };
// }

// export type UserMenuFeature = {
//   name: string; //      name of the feature
//   url?: string; //      url to redirect on click
// }

// export type BankerPreviewMetadataToDisplay = {
//   metadata?: string;
//   displayName?: string;
//   icon?: string;
// }

// export type DealsPreviewMetadataToDisplay = {
//   metadata?: string;
//   displayName?: string;
// }

// export type DocumentPreviewMetadataToDisplay = {
//   collection?: string;
//   tabDisplayName?: string;
//   itemsToDisplay?: DocumentPreviewDisplayItem[];
// }

// export type DocumentPreviewLookupItem = {
//   tabDisplayName?: string;
//   itemsToDisplay?: DocumentPreviewDisplayItem[]
// }

// export type DocumentPreviewDisplayItem = {
//   metadata?: string;
//   displayName?: string;
//   icon?: string;
// }

// export type HackFeatures = {
//   previewRenderingDelay?: number; //    delay before rendering preview in ms
// };

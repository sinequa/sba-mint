import {LocaleData} from "@sinequa/core/intl";
import {enCore} from "@sinequa/core";
import "intl/locale-data/jsonp/en-US"; // Safari
import {Utils} from "@sinequa/core/base";
import {enUtils} from "@sinequa/components/utils";
import {enAdvanced} from "@sinequa/components/advanced";
import {enAlerts} from "@sinequa/components/alerts";
import {enBaskets} from "@sinequa/components/baskets";
import {enFacet} from "@sinequa/components/facet";
import {enFeedback} from "@sinequa/components/feedback";
import {enLabels} from "@sinequa/components/labels";
import {enMetadata} from "@sinequa/components/metadata";
import {enNotification} from "@sinequa/components/notification";
import {enPreview} from "@sinequa/components/preview";
import {enResult} from "@sinequa/components/result";
import {enResultsView} from "@sinequa/components/results-view";
import {enSavedQueries} from "@sinequa/components/saved-queries";
import {enSelection} from "@sinequa/components/selection";
import {enSearch} from "@sinequa/components/search";
import {enStatusBar} from "@sinequa/components/status-bar";
import {enUserSettings} from "@sinequa/components/user-settings";
import {enML} from "@sinequa/components/machine-learning";
import {enFilters} from "@sinequa/components/filters";
import {enSearchForm} from "@sinequa/components/search-form";

import d3Format from "../../../node_modules/d3-time-format/locale/en-US.json";

const messages = Utils.merge({}, enCore, enUtils, enAdvanced, enAlerts, enBaskets, enFacet, enFeedback, enLabels, enMetadata,
    enNotification, enPreview, enResult, enResultsView, enSavedQueries, enSelection, enSearch, enStatusBar, enUserSettings,
    enML, enFilters, enSearchForm);

export default <LocaleData> {
    intl: {
        locale: "en-US"
    },
    d3: {
        locale: "en-US",
        format: {},
        time: d3Format
    },
    messages: messages
};
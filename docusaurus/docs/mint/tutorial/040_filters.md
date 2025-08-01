---
layout: default
title: Adding a Filter
parent: Tutorial
sidebar_position: 4
---
import useBaseUrl from '@docusaurus/useBaseUrl';

# Default Filters

In this section, you will modify the default filters.

The Mint application includes buttons that allow the user to filter results.  

<p align="center">
<img src={useBaseUrl('/img/tutorial/040_filters/filters.png')} width="50%" alt="Default Filters"/>
</p>

Multiple filter buttons display by default and a **More filters** button allows the end user to access additional filters as well. 

The filters are based on *aggregations* configured in the **mint_query** web service in the Sinequa administration interface.

<p align="center">
<img src={useBaseUrl('/img/tutorial/040_filters/mint_aggregations.png')} width="70%" alt="Mint Aggregations"/>
</p>

The default filters use the following aggregations: 
- Dates
- Sources 
- People
- Companies
- Places
- Authors
- Sizes
- Formats
- Languages
- Concepts

:::note    
The *filter buttons* appears in the Mint UI in the **same order** as the aggregations found in the *mint_query web service*. If you wish to reorder the filter buttons, you simply need to reorder the aggregations in your mint_query web service. 
:::


# Modifying the Default Filters

1. In your Mint workspace, go to **src** > **app** > **app.config.ts**.

2. Look for the *provider object* that has the **AGGREGATIONS_NAMES** token (and potentially other aggregation names). This object will be **commented out** by default.


```
//{ provide: AGGREGATIONS_NAMES, useValue: ['Money', 'Companies', ...AGGREGATIONS_NAMES_PRESET_DEFAULT]},
```

:::note    
-  The *useValue* property provides a static value that can be used as a dependency.

- In Mint, the *useValue* property includes the **AGGREGATIONS_NAMES_PRESET_DEFAULT** constant. This constant includes the previously mentioned aggregations found in the default _mint_query web service.

You can remove the existing values and add different aggregation names to the *useValue* list. 
:::

3. Uncomment the provider object:

```
{ provide: AGGREGATIONS_NAMES, useValue: ['Money', 'Companies', ...AGGREGATIONS_NAMES_PRESET_DEFAULT]},
```
:::note    
Because this provider is commented out, AGGREGATIONS_NAMES and AGGREGATIONS_NAMES_PRESET_DEFAULT are no longer imported in the app.config.ts file.

You must add AGGREGATIONS_NAMES to the appropriate import statement, and you can choose to add AGGREGATIONS_NAMES_PRESET_DEFAULT to the appropriate import statement, if you are using it for your filter configuration.

You can also hover over AGGREGATIONS_NAMES, click **Quick Fix**, and choose **Update import from "@sinequa/atomic-angular"**.

<p align="center">
<img src={useBaseUrl('/img/tutorial/040_filters/quick_fix.png')} width="70%" alt="Mint Aggregations"/>
</p>
:::


4. Replace all values currently found in the *useValue* list and add the **Finance**, **Dates**, **Events**, and **Exectitle** aggregations.

```
{ provide: AGGREGATIONS_NAMES, useValue: ['Finance','Dates','Event','Executive'] },
```

:::note 
These aggregations have been created for you in the ** mint_query Web Service** on the Sinequa demo server.
:::

5. Save your changes.

:::note
If you followed the **Connecting to Sinequa** tutorial, Mint should recompile automatically. If not, execute the `npm run start` command in the terminal. 
:::

6. Go to your Mint application and search for **Bill Gates**.

<p align="center">
<img src={useBaseUrl('/img/tutorial/040_filters/updated_filters.png')} width="70%" alt="Updated Filters"/>
</p>

There should now be different filters available.

:::note    
As a reminder, the *filter buttons* appears in the Mint UI in the **same order** as the aggregations found in the *mint_query web service*. If you wish to reorder the filters, you simply need to reorder the aggregations in your mint_query web service. 
:::

For more information about filters in Mint, see the [**Filter**](../configurations/filters.mdx) documentation page.
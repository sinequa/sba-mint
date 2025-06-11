---
layout: default
title: Adding Result Metadata
parent: Tutorial
sidebar_position: 8
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Adding Result Metadata

In this chapter, you will add metadata below the extracts in each result.

When you execute a search in Mint, the out-of-the-box results list includes an extract of the retrieved document based on the search terms.

<p align="center">
<img src={useBaseUrl('/img/tutorial/080_result-metadata/results_original.png')} width="70%" alt="Original results in Mint"/>
</p> 

For each result, you will add the **Executive Titles** and **Finance** metadata, if any, below the result extract.

:::note
If you are using your own Sinequa instance, you should modify these values for your own selected metadata.
:::

1. Go to **src** > **app** > **components** > **cards** > **record** > **record-card.html**.

:::note
<p align="center">
<img src={useBaseUrl('/img/tutorial/080_result-metadata/recordcard.png')} width="70%" alt="HTML Code for RecordCardComponent"/>
</p> 

You should see code similar to this, detailing the elements that can appear in each *record card* on the search page.
:::

You want to place the metadata below the result extract.

2. Look for the following lines of code:

```
<CardContent class="flex grow flex-col gap-2 overflow-auto break-words">
  <p class="break-word line-clamp-2" [innerHTML]="extract()"></p>
```

3. Below the extract paragraph, add the following:

```
@if (article()['exectitle']) {
<table>
  <th class="flex items-center gap-2">
    Executive Titles
  </th>
  <td>
    <metadata [article]="article()" metadata="exectitle" />
  </td>
</table>
        }

@if (article()['finance']) {
<table>
  <th class="flex items-center justify-start gap-2 text-left pl-4">
    Finance
  </th>
  <td>
    <metadata [article]="article()" metadata="finance" />
  </td>
</table>
}
```

The *if statements* check whether there are any values for the **exectitle** and **finance** metadata.

If there are values for that specific metadata, then a table displays a label and the metadata.

4. Save your changes.

:::note
If you followed the [Connecting to Sinequa tutorial](020_connection.md), Mint should recompile automatically. If not, run the `npm run start` command in the terminal. 
:::

5. Go to your Mint application and search for **Walmart**. 

<p align="center">
<img src={useBaseUrl('/img/tutorial/080_result-metadata/resultsmetadataadded.png')} width="70%" alt="Metadata added to Results"/>
</p>

You should now see the Executive Titles and Finance metadata displayed below each result's extract.

:::note
In Mint, the metadata component is a dumb component that only knows how to display the values from a metadata property.

The display of that metadata, including any label, icon, or action like filtering, must be handled by you in the code.

If you scroll down the list, you will notice that the chosen classes for this exercise are not ideal for all results. Because the component is dumb, you can modify elements such as the layout to meet your needs.
:::
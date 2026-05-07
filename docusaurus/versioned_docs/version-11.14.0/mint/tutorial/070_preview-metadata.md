---
layout: default
title: Modifying Preview Metadata
parent: Tutorial
sidebar_position: 7
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Modifying the Preview Metadata

In this chapter, you will explore how to modify the metadata that appears at the top of the document preview panel. 

<p align="center">
<img src={useBaseUrl('/img/tutorial/070_preview-metadata/preview-metadata-crop.png')} width="60%" alt="Original metadata at top of preview"/>
</p>

The out-of-the-box metadata that displays at the top of the preview panel in Mint includes the **location** (of the document), **authors**, **modified**, and **docformat**. 

The **authors** and **modified** metadata only display if they are present in the record.

In this tutorial, you will add two additional pieces of metadata:
- **Executive Titles** (stored in entity13) using the **exectitle** column alias.
- **Financial Terms** (stored in entityt14) using the **finance** column alias.

These metadata will only display if they are present in the selected record. 

:::note
If you are using your own Sinequa instance, you should modify these values for your own selected metadata.
:::

## Modifying the preview-default.component.html File

1. Go to **src** > **components** > **preview** > **preview-header**, and open the **preview-header.html** file.

2. Locate the following:
    ```
    <div [class]="cn('w-full', headerCollapsed() && 'hidden')">
    ``` 

3. Within this **div**, locate the following code blocks: 

     ```
    @if ((article().authors || []).length > 0)
    ``` 
	
	     ```
    @if (article().modified)
    ``` 

<p align="center">
<img src={useBaseUrl('/img/tutorial/070_preview-metadata/authors_modified_code.png')} width="70%" alt="Default authors and modified in preview-default.component.html file"/>
</p> 

These blocks display the authors and modified metadata if it is present in the selected record. 

:::note
In this case, **article** is a property of the **PreviewHeaderComponent**, computed from the record as declared in the **preview-header.ts** file.  
:::

4. After the `@if (article().modified)` block, add the following:

    ```
	@if ((article()['exectitle'] || []).length > 0) {
          <tr>
          <th>{{ 'jobTitle' | transloco }}</th>
        
          <td class="flex flex-wrap gap-2">
            <Metadata class="badge badge-sm empty:hidden" [article]="article()!" metadata="exectitle" />
          </td>
          </tr>
        }
        
        @if ((article()['finance'] || []).length > 0) {
          <tr>
          <th>{{ 'financialTerm' | transloco }}</th>
        
          <td class="flex flex-wrap gap-2">
            <Metadata class="badge badge-sm empty:hidden" [article]="article()!" metadata="finance" />
          </td>
          </tr>
        }
    ```


:::note
The **exectitle** property comes from an index signature, so it must be accessed using **`['exectitle']`**. 
:::

4. Save your changes.

:::note
If you followed the [Connecting to Sinequa tutorial](020_connection.md), Mint should recompile automatically. If not, run the `npm run start` command in the terminal. 
:::

5. Go to your Mint application and execute a search for **finance**.

6. Click on the first result, which should be **Outline of finance**, to display the HTML document preview.

<p align="center">
<img src={useBaseUrl('/img/tutorial/070_preview-metadata/preview_metadata_needs_json.png')} width="70%" alt="Job Title and Financial Terms Metadata Displays - Needs Label Update"/>
</p> 

<p align="center">
You should see the **Job Title** (exectitle) and **Financial Terms** (finance) metadata displayed at the top of the preview panel.
</p>

:::note
Notice that the labels for the metadata look somewhat odd. Currently, they use the references found in 
   ```
    <th>{{ 'jobTitle' | transloco }}</th>
   ```
This approach allows you to internationalize the labels in Mint. 

For a detailed explanation, see the [Tabs and Internationalization](050_tabs-international.md) tutorial.
:::

7. Go to **src** > **assets** > **i18n**, and open the **en.json** file.

8. Add the following inside the root object:

```
"jobTitle": "Job Titles",
"financialTerm": "Financial Terms",
```

9. Save your changes.

10. Go back to Mint and refresh.

<p align="center">
<img src={useBaseUrl('/img/tutorial/070_preview-metadata/updated_preview_metadata.png')} width="70%" alt="Job Title and Financial Terms Metadata Displays with Correct Label"/>
</p> 

<p align="center">
You should see the **Job Title** and **Financial Terms** with the correct labels.
</p>

---
layout: default
title: Highlighting Entities in the Preview
parent: Tutorial
sidebar_position: 6
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Highlighting Entities in the SBA Preview

In this chapter, you will highlight entities in the Mint document preview.

## Backend Configuration

When indexing data, you have to set up entities for extraction, which are stored in the Sinequa index(es).

:::note
In the Sinequa demo server, there are multiple entities extracted for you.

In this exercise, you will highlight two entities: *entity13*, using the column alias **exectitle**, and *entity14*, using the column alias **finance**.

As a reminder, use of column aliases is a best practice, and they are created in the **Mint Query Web Service**.
:::

Additionally, a Preview Web Service must be configured to define the highlights to display. This web service is then attached to your app.

<p align="center">
<img src={useBaseUrl('/img/tutorial/060_highlights/preview_webservice.png')} width="100%" alt="Preview Web Service"/>
</p>

## Modifying the highlight.config.ts File

:::info File location per release
The location of `highlight.config.ts` changed between releases:

| Release                 | Path                              |
|-------------------------|-----------------------------------|
| **11.13.0 and earlier** | `src/app/highlight.config.ts`     |
| **11.14.0 and later**   | `src/config/highlight.config.ts`  |

The file structure and the `PREVIEW_HIGHLIGHTS` constant are identical in both locations — only the path differs.
:::

### release/11.13.0 and earlier

1. Go to **src > app > highlight.config.ts**.

2. Add the following to the **PREVIEW_HIGHLIGHTS** constant:

    ```ts
    {
      name: 'exectitle',
      color: 'black',
      bgColor: '#F5DCD5'
    },
    {
      name: 'finance',
      color: 'black',
      bgColor: '#59ED78'
    },
    ```

3. Save your changes.

### release/11.14.0 and later

Starting from release 11.14.0, the configuration file was moved out of the `app/` folder into a dedicated `config/` folder to separate application configuration from Angular application code.

1. Go to **src > config > highlight.config.ts**.

2. Add the following to the **PREVIEW_HIGHLIGHTS** constant:

    ```ts
    {
      name: 'exectitle',
      color: 'black',
      bgColor: '#F5DCD5'
    },
    {
      name: 'finance',
      color: 'black',
      bgColor: '#59ED78'
    },
    ```

3. Save your changes.

:::note
If you followed the [Connecting to Sinequa tutorial](020_connection.md), Mint should recompile automatically. If not, run the `npm run start` command in the terminal.
:::

4. Go to your Mint application and execute a search for **Morgan Stanley**.

5. Click on the first result (anywhere other than the title) to display the HTML document preview.

<p align="center">
<img src={useBaseUrl('/img/tutorial/060_highlights/docpreview.png')} width="90%" alt="HTML document preview"/>
</p>

6. In the preview panel, toggle entity higlighting on by clicking the **lightbulb icon**.

:::note
You should see finance terms (e.g., investment, revenue) highlighted in green:

<p align="center">
<img src={useBaseUrl('/img/tutorial/060_highlights/financeentities.png')} width="50%" alt="Finance entities highlighted"/>
</p>

You should also see executive titles (e.g., CEO, chief operating officer) highlighted in pink:

<p align="center">
<img src={useBaseUrl('/img/tutorial/060_highlights/exectitles.png')} width="50%" alt="Executive Title entities highlighted"/>
</p>

:::

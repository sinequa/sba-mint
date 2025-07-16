---
layout: default
title: Including a Filter on the Left Side
parent: Tutorial
sidebar_position: 10
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Including a Filter on the Left Side

In this chapter, you will add a Sources filter on the left side. 

There may be times when you want the content of a filter to be visible at all times. For example, you may want the Sources to always be displayed and filterable without having to click on a filter button. 

One option is to add the filter on the left side so that it is visible and usable as you search.

:::note
If you are using your own Sinequa instance, you should modify these values for your own selected metadata.
:::

First, you will need to import the AggregationComponent into the search-all component so that it can be used in your filter.

1. Go to **src** > **app** > **pages** > **search** > **all** > **search-all.component.ts**.

2. At about line 11 (line numbers are subject to change), look for the following **import statement**:

```
import { AggregationsStore, AppStore, DidYouMeanComponent... SponsoredResultsComponent, UserSettingsStore } from 
'@sinequa/atomic-angular';
```

3. After **UserSettingsStore**, add a **comma** followed by **AggregationComponent**.

4. Then go to about line 51 (line numbers are subject to change), and you should find an **imports array** inside of the **@Component** decorator:

<p align="center">
<img src={useBaseUrl('/img/tutorial/100_filter-left-side/componentdecorator.png')} width="30%" alt="Component Decorator"/>
</p> 


5. After the last item in this array (it was **CardSkeleton** in this image but it could change over time), add a **comma** followed by **AggregationComponent**.

This allows the **AggregationComponent** to be used inside the template of **search-all** component.

6. Go to **src** > **app** > **pages** > **search** > **all** > **search-all.component.html**.

At the top, you should see a **`<main>`** element:

<p align="center">
<img src={useBaseUrl('/img/tutorial/100_filter-left-side/mainsearchall.png')} width="80%" alt="Code showing main element"/>
</p> 

7. Add a line space before the `<main>` element and paste the following above the `<main>` element:

```
<div class="mt-4 ml-14">
  <div class="sticky top-20">
    <div [class]="cn('relative ml-5 hidden h-full p-4 opacity-0 lg:block', drawerOpened() ? 'animate-slide-out' : 'animate-slide-in opacity-100')">
      <Aggregation name="Sources" column="treepath" [showCount]="true" />
    </div>
  </div>
</div>
```

<p align="center">
<img src={useBaseUrl('/img/tutorial/100_filter-left-side/leftfiltercodeadded.png')} width="70%" alt="Shows addition of source filter code before main element"/>
</p> 


:::note
This code block uses spacing (ml-14, mt-4), makes the filter sticky as you scroll (sticky top-20), and conditionally shows or hides it based on whether the preview panel is opened or closed.
:::


8. Save your changes.

:::note
If you followed the *Connection to the Sinequa demo server* tutorial, Mint should recompile automatically. If not, execute the npm run start command in the terminal. 
:::

9. Go to your Mint application and search for **assisstant**. 

<p align="center">
<img src={useBaseUrl('/img/tutorial/100_filter-left-side/leftfilteradded.png')} width="90%" alt="Source filter added on left"/>
</p> 

You should now see a **Sources filter** on the left side of Mint. 

:::note
In the provided screenshot, the branches have been expanded manually. Your Sources filter will initially display collapsed branches. 
:::
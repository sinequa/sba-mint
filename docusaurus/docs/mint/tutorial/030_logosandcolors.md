---
layout: default
title: Changing Logos and Colors
parent: Tutorial
sidebar_position: 3
---
import useBaseUrl from '@docusaurus/useBaseUrl';

# Changing Logos and Colors

In this chapter, you will learn how to modify the default logos and colors.

## Options for Modifying the Logo

There are several options for how to modify the logo in Mint.

1. There are two logo image files included in Mint by default: *small.svg* and *large.svg*. You could add two files with the same name to **src** > **assets** > **logo**, overwriting the existing images.
        
2. You can add new image file(s) (e.g., svg, png, jpg) to the **assets** > **logo** directory. Then go to the **Customization (JSON) tab** in your App in the administration interface. In the **Extra customization JSON files** section, edit the **general** file. Here you will find a *logo object* that includes options for both light and dark mode for both the small and large images.

<p align="center">
<img src={useBaseUrl('/img/tutorial/030_logosandcolors/general_custjson.png')} width="50%" alt="Customization JSON - General"/>
</p>

Modify the appropriate small and large string values with the location and file name for your images.

:::note
This is the recommended best practice for this change. 
:::

3. As an alternative, images can also be provided in **Base64**. For example, you can go to the **Customization (JSON) tab** in your App in the administration interface. In the **Extra customization JSON files** section, edit the **general** file. Here you will find a *logo object* that includes options for both light and dark mode for both the small and large images. 

You can overwrite this JSON and include the Base64 for your images such as:

```
{
    "name": "Training Blue",
    "logo": {
        "alt": "Training Blue",
        "light": {
            "small": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ0AAACECAYAAACK/ymFAAAAAXNSR0IB2cksfwAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB+kFHA0cBMZyjaoAAAFvSURBVHja7d2xDYJAFIDhh7G1IAxgwxLGFdQZTJjA1hEYgxlYgQFoYAAqpsDeRoyRQPJ9NQmXd3+O4gqSPB2mgAXtjADRIToQHaID0SE6EB2iQ3QgOkQHokN0IDpEB6JDdIgORIfoQHSIDkSH6BAdiA7RgegQHYiONdpvbcGnyzOqqrJzb/q+j9v54KQD0SE6RAeiQ3QgOkQHomOdNncj0bZtlGW56DuzLIuiKGY/33Vd1HW96BrHcYyIxyb2MPGbps++vXprmibu16PB+bwiOkQHokN0IDpEB6JDdCA6RIfoQHSIDkSH6EB0iA7RgegQHYgO0YHoEB2IDtEhOhAdogPRIToQHaJDdCA6RAeiQ3QgOkQHokN0iA5Eh+hAdIgORIfoEB2IDtGB6BAdiA7RgegQHaID0SE6EB2iA9EhOkRnBIgO0YHoEB2IDtGB6BAdooO/S/J0mIwBJx2iA9EhOhAdogPRITpEB6JDdPCTF1ilIIx5++o2AAAAAElFTkSuQmCC",
            "large": "data:image/png;base64,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"
        },
        "dark": {
            "small": null,
            "large": null
        }
    }
}

```

If you have access to your own Sinequa server, you can test this Customization JSON by making a copy of the _mint App, renaming it, and then modifying the general file in the Customization JSON tab with this example.

<p align="center">
<img src={useBaseUrl('/img/tutorial/030_logosandcolors/trainingblue.png')} width="90%" alt="Training Blue Logo"/>
</p>

4. Finally, you can add new image file(s) to the **assets** > **logo** directory, and assuming you do not intend to use dark mode, you can comment out the effect() method from the **app.component.ts** file. Then you would simply need to modify the **styles.css** file to use your newly added images.

:::note
Since you do not have access to the Sinequa server backend, you will use this final option in the exercise that follows. 
:::

## Modifying the Logo Exercise

In this exercise, you can use the following images by right clicking on them and choosing Save image as...

<p align="center">
<img src={useBaseUrl('/img/tutorial/030_logosandcolors/trainingsmall.png')} width="10%" alt="Small sample image"/>
</p>

<p align="center">
<img src={useBaseUrl('/img/tutorial/030_logosandcolors/traininglarge.png')} width="40%" alt="Large sample image"/>
</p>

Alternatively, you can use your own images (e.g., svg, png, jpg). One should be small (approx. 157 X 132), and the other should be larger (approx. 803 X 201).

1. Go to **src** > **assets** > **logo** and add your two image files (e.g., *trainingsmall.png* and *traininglarge.png*). 

2. Then go to **src** > **styles.css**.

3. Locate the following:

```
  --logo-small: url('assets/logo/small.svg');
  --logo-large: url('assets/logo/large.svg');
  --logo-small-alt-text: 'Sinequa logo';
  --logo-large-alt-text: 'Sinequa logo';
```

4. Modify this styling as follows (using your image names, as necessary):

```
  --logo-small: url('assets/logo/trainingsmall.png');
  --logo-large: url('assets/logo/traininglarge.png');
  --logo-small-alt-text: 'Small training logo';
  --logo-large-alt-text: 'Large training logo';
```

5. Go to **app.component.ts** and locate the following:

```
      if (general) {
        if (general.name) {
          this.title.setTitle(general!.name);
        }
        if (general.logo?.light?.small) {
          document.documentElement.style.setProperty(`--logo-small`, `url(${general.logo?.light?.small})`);
        }
        if (general.logo?.light?.large) {
          document.documentElement.style.setProperty(`--logo-large`, `url(${general.logo?.light?.large})`);
        }
      }
    });
```

6. Comment out this code:

```
    /* effect(() => {
      const general = this.appStore.general();

      if (general) {
        if (general.name) {
          this.title.setTitle(general!.name);
        }
        if (general.logo?.light?.small) {
          document.documentElement.style.setProperty(`--logo-small`, `url(${general.logo?.light?.small})`);
        }
        if (general.logo?.light?.large) {
          document.documentElement.style.setProperty(`--logo-large`, `url(${general.logo?.light?.large})`);
        }
      }
    }); */

```

:::note
This code is used when light and dark mode are available for your Mint implementation. 
:::

7. Save your changes.

:::note
If you followed the [Connecting to Sinequa tutorial](020_connection.md), Mint should recompile automatically. If not, run the `npm run start` command in the terminal.
:::

8. Go to your Mint application, and you should see the updated large logo.

<p align="center">
<img src={useBaseUrl('/img/tutorial/030_logosandcolors/homelogochanged.png')} width="70%" alt="Home Page with New Logo"/>
</p>


9. Execute a search for **life science**, and you should see the updated small logo  

<p align="center">
<img src={useBaseUrl('/img/tutorial/030_logosandcolors/resultlogochanged.png')} width="70%" alt="Home Page with New Logo"/>
</p>


## Modifying Colors Exercise

The Mint application allows you to change the colors of the Mint UI in the **styles.css** file:

```css
...
  --color-backdrop: rgba(0, 0, 0, 0.4);
  --color-background: #ffffff;
  --color-foreground: #23272e;
  --color-card: #ffffff;
  --color-card-foreground: #1c1c1c;
  --color-popover: #ffffff;
  --color-popover-foreground: #1c1c1c;

  --color-primary: #0084ff;
  --color-primary-hover: #0056ff;
  --color-primary-active: #0040bf;
  --color-primary-foreground: #ffffff;

  --color-secondary: #526077;
  --color-secondary-hover: #434e61;
  --color-secondary-active: #3a4252;
  --color-secondary-foreground: #ffffff;

  --color-muted: #f6f7f9;
  --color-muted-foreground: #8695aa;

  --color-accent: #f2f2f2;
  --color-accent-foreground: #1c1c1c;

  --color-destructive: #ff2a1d;
  --color-destructive-hover: #c8180d;
  --color-destructive-active: #a5180f;
  --color-destructive-disable: #ffc8c5;
  --color-destructive-foreground: #ffffff;

  --color-border: #f6f7f9;
  --color-input: #d5d9e2;
  --color-ring: #1a73e8;

  --color-alert: #ff2a1d;
  --color-success: #2ed73f;
  --color-highlight: #fff7ab;
...
```

1. Go to **src** > **styles.css**.

2. Modify the following:

```
  --color-primary: #b37ede;
```
:::note
This color has been chosen solely to show a clear change in the colors for this exercise.  
:::

3. Save your changes.

:::note
If you followed the *Connection to the Sinequa demo server* tutorial, Mint should recompile automatically. If not, execute the npm run start command in the terminal. 
:::

4. Go to your Mint application and search for **life science**.

<p align="center">
<img src={useBaseUrl('/img/tutorial/030_logosandcolors/homecolorschanged.png')} width="70%" alt="Text Color Changed"/>
</p>

The *result title text color* should be modified to a shade of purple:  #b37ede.

---
layout: default
title: Connecting to Sinequa
parent: Tutorial
sidebar_position: 2
---
import useBaseUrl from '@docusaurus/useBaseUrl';

# Connecting to Sinequa

In this chapter, you will learn how to connect the [**Mint**](../../index.md) app to the Sinequa demo server. The URL of this server is:  
`https://su-sba.demo.sinequa.com` and the name of the app configured on the server is `training-mint`. Additionally, the app is secured with the OAuth protocol. The name of the identity provider is `identity-dev`.

The backend is preconfigured so you can serve the Mint application by executing `npm run start` in a terminal in Visual Studio Code.

:::note  
  Regarding npm run start, **start** is defined in the package.json file in *scripts*. By default, executing this command will run *ng serve*.

  Additional scripts are also provided in the package.json file. 
:::

1. In Visual Studio Code, open a Terminal (e.g., Terminal > New Terminal). 

2. Change directories and clone the Mint Angular workspace into a folder of your choice:

`git clone https://github.com/sinequa/sba-mint.git`

3. Change directories to the `sba-mint` folder (e.g., cd .\sba-mint\) and execute the following command to install dependencies with NodeJs:

`npm install`

:::note  
  This may take several minutes.
:::

4. Add the `sba-mint` repository to Visual Studio Code (e.g., File > Add Folder to Workspace).

5. Position yourself at the root of `sba-mint` (for example: `c:\dev\sba-mint`), and run the following command:

`npm run start`

The process ends with the following messages:  

```
...
Application bundle generation complete. [6.016 seconds]

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   https://localhost:4200/
  ➜  Local:   https://localhost.localdomain:4200/
  ➜  Local:   https://lvh.me:4200/
  ➜  Local:   https://vite.lvh.me:4200/
  ➜  press h + enter to show help
```

6. Navigate to https://localhost:4200 with your usual web browser. 

:::note
If you are prompted with an unsecure certicate prompt, click on **Advanced**`** >  
**Proceed to localhost**. 
:::

The following login page displays:

<p align="center">
<img src={useBaseUrl('/img/tutorial/020_connection/sinequa_login_screen.png')} width="30%" alt="Login screen"/>
</p>

:::note  
  If you do not have credentials, send a request to https://www.sinequa.com/account-request/.
:::

7. Enter your credentials.

You are redirected to the search homepage. You can start your search.



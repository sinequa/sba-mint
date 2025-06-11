---
layout: default
title: Introduction
parent: Tutorial
sidebar_position: 1
---

# Introduction

The goal of this tutorial is to explain how to get started with Mint.

A Sinequa server is available and pre-configured for you to develop and test your application, so you don't have to worry about the backend configuration. This tutorial is manageable for any Angular developer without specific knowledge about Sinequa (other than general concepts that are explained in this tutorial). Developers need an account to connect to this server, so [contact us](https://www.sinequa.com/account-request/) if you do not have one yet. 

You will use `ng serve` to serve your application locally on your own computer (`localhost`), while the data will come from the remote Sinequa server.

## Prerequisites

Before you start, install the following tools:

- [NodeJs](https://nodejs.org/en/download).
- [Visual Studio Code](https://code.visualstudio.com/download).
- [Git](https://git-scm.com/downloads).

## Methodology

For this tutorial, we recommand using:

- **Visual Studio Code** (with the Angular workspace root opened), 
- A **modern browser** (Google Chrome, Firefox) to test and inspect your app. 
- Keep one (or more) terminal(s) opened in Visual Studio Code to run commands like `ng serve`, `git status` or `ng generate component`.
- **Git** to track changes during the different steps of the tutorial. At the end of each chapter, you should commit your changes in a `tutorial` branch to make it easier to track and revert changes or to return to a previous tutorial.

You might face runtime errors not detected during compilation. The only way to see these errors is to keep the **inspector** of your web browser opened with an eye on the **console**.

## Cloning the Mint Angular Workspace

1. Use the following command to clone the Mint Angular workspace in a folder of your choice. For example: `c:\dev\sinequa\sba`

`git clone https://github.com/sinequa/sba-mint.git`

This command clones the Mint SBA into `c:\dev\sinequa\sba\sba-mint`

2. Within `c:\dev\sinequa\sba\sba-mint`, use the following command to install the dependencies with NodeJs:

`npm install`

Unless otherwise specified, this tutorial uses the [**Mint SBA**](/sba-mint/) application included in the workspace inside **src**.

## Contents

The tutorial is divided into chapters that each deal with a Sinequa feature. 

- [Updating an Angular Application](010_updating.md)
- [Connecting to Sinequa](020_connection.md)
- [Changing Logos and Colors](030_logosandcolors.md)
- [Adding a Filter](040_filters.md)
- [Tabs and Internationalization](050_tabs-international.md)
- [Highlighting Entities in the Preview](060_highlighting.md)
- [Modifying Preview Metadata](070_preview-metadata.md)
- [Adding Result Metadata](080_result-metadata.md)

:::note
You must complete the Connecting to Sinequa exercise before attempting any other exercises in this tutorial. The other exercises are independent from one another. 

Disclaimer: This tutorial was created using Mint v. 0.0.0.0 and Sinequa v. 11.13.0.1030. It is possible that changes to one or both of these may require you to modify the steps provided throughout this tutorial.
:::

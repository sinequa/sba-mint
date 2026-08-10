---
layout: default
title: Updating an Angular Application
parent: Tutorial
sidebar_position: 1
---

# Updating an Angular Application

There are two main options when updating an Angular application cloned from a GitHub repository: **In-Place Editing** and **Component Duplication**.

## Editing Components "In Place"

| **Pros**                                                          | **Cons**                                                           |
|-------------------------------------------------------------------|--------------------------------------------------------------------|
| Keeps the codebase clean and avoids duplication.                | Harder to revert changes without Git.                            |
| Git can track changes easily, making differences easier to read.       | Higher risk of merge conflicts when pulling upstream changes.    |
| Less maintenance burden.                                        |                                                                    |

**Git Pull Implications**

- If the upstream repository has changes to the same files you modified, a conflict may occur.
- Running git pull will attempt to merge changes. If there is a conflict, Git will ask you to resolve it manually.
- Using git stash before pulling can help to temporarily save your work in case of conflicts.

## Duplicating Components

| **Pros**                                                          | **Cons**                                                           |
|-------------------------------------------------------------------|--------------------------------------------------------------------|
| Preserves the original component as a backup.                   | Introduces redundancy, increasing maintenance effort.            |
| Allows side-by-side comparison of old and new implementations.  | Can clutter the codebase with unused or legacy components.       |
| Reduces merge conflicts since the original files remain untouched.  | Requires eventual cleanup to maintain a clean codebase.          |

**Git Pull Implications**

- If you haven’t modified the original component, git pull will work smoothly with no conflicts.
- However, if upstream changes affect the old component and you later need to integrate them into your duplicate, merging efforts may be required.

## Recommendations

The choice between editing a component in place or duplicating it depends on the scope of your changes and your development approach. 

If your modifications are minor and must be applied to the same component, it is best to edit **in place** to maintain a clean and manageable codebase. 

However, if you are undertaking a major refactor or need to experiment with a different implementation while preserving the original functionality, **duplicating** the component can be a safer approach. 

Ultimately, this decision is up to the developer, based on project needs, team workflow, and personal coding preferences.

:::note
For this tutorial, whenever required, we will use the **in-place** editing approach.
:::
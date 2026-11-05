---
title: User Profile
---

The `User Profile` feature has 2 components, `UserProfileDialog` that only allows opening the second one, `UserProfileFormComponent`, in a dialog.

# UserProfileDialog

## API Reference

### Properties

| Property  | Type | Description |
|---|---|---|
| `opened`   | `signal<boolean>`   | Whether the dialog has been opened. Since the dialog is loaded in the main pages, it allows to not load `UserProfileFormComponent` before we need to                     |

## Usage

```ts title="sample.component.ts"
import { UserProfileDialog } from "@sinequa/atomic-angular";
import { ButtonComponent } from '@sinequa/ui';

@Component({
    selector: "sample-component",
    imports: [UserProfileDialog, ButtonComponent],
    template: `
    <button (click)="openDialog()">Open</button>
    <user-profile-dialog />
    `,
}) export class SampleComponent {

    readonly userProfileDialog = viewChild(UserProfileDialog);

    openDialog() {
        this.userProfileDialog()?.open();
    }
}
```

# UserProfileFormComponent

## API Reference

### Properties

| Property  | Type | Description |
|---|---|---|
| `dataKeys` | `string[]` | Default keys from the user profile's `data` property. |
| `keys`| `computed<string[]>`   | The keys to use from the user profile's `data` property, filtered with the optional custom JSON's `userProfile.data` parameter. |
| `formKeys`| `computed<string[]>`   | The keys from `keys` to use in the actual form (all but profilePhoto). |
| `allowProfilePhoto`| `computed<boolean>`   | Whether the profile photo is enabled. |
| `initials`| `computed<string>`   | The user's initials. |
| `username`| `computed<string>`   | The user's username. |
| `propertyToEdit`| `signal<string \| undefined>`   | The current property being edited. |
| `value`| `model<string \| undefined>`   | The value of the current property being edited. |
| `currentLanguage`| `model<string>`   | The current language of the app. |
| `AllLanguages`| `model<any[]>`   | Available languages allowed to be switched between. |
| `changingPassword`| `signal<boolean>`   | Whether we display `ChangePasswordComponent`. |
| `customData`| `computed<string[]>`   | The keys to the additional parameters set in the optional custom JSON's `userProfile.customData` parameter. |
| `allowChangePassword` | `computed<boolean>` | Whether the user is allowed to change the password. |

## Usage

```ts title="sample.component.ts"
import { UserProfileFormComponent } from "@sinequa/atomic-angular";

@Component({
    selector: "sample-component",
    imports: [UserProfileFormComponent],
    template: `
    <user-profile-form />
    `,
}) export class SampleComponent {}
```

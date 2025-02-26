import { Component, inject, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { toast } from 'ngx-sonner';

import { globalConfig, login, setGlobalConfig } from '@sinequa/atomic';
import {
  ApplicationService,
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  PrincipalStore
} from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'override-user-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    DialogComponent,
    DialogContentComponent,
    DialogTitleComponent,
    DialogHeaderComponent,
    DialogFooterComponent,
    TranslocoPipe
  ],
  providers: [provideTranslocoScope({ scope: 'dialog', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'dialog.overrideUser.title' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent class="flex flex-col gap-4">
        <input
          class="h-10 w-full rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
          type="text"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-label]="'dialog.overrideUser.usernameToOverride' | transloco"
          [attr.placeholder]="'dialog.overrideUser.usernameToOverride' | transloco"
          [(ngModel)]="overrideUser().username"
          (keydown.enter)="override()" />

        <input
          required
          class="h-10 w-full rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
          type="text"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-label]="'dialog.overrideUser.domainToOverride' | transloco"
          [attr.placeholder]="'dialog.overrideUser.domainToOverride' | transloco"
          [(ngModel)]="overrideUser().domain"
          (keydown.enter)="override()" />
      </DialogContent>

      <DialogFooter>
        <button variant="ghost" (click)="dialog.close()">
          {{ 'cancel' | transloco }}
        </button>

        <button (click)="override()">
          {{ 'dialog.overrideUser.override' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class OverrideUserDialogComponent {
  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  private readonly appService = inject(ApplicationService);
  private readonly principalStore = inject(PrincipalStore);

  readonly overrideUser = model<{ username: string; domain: string }>({ username: '', domain: '' });

  showModal() {
    this.dialog()!.showModal();
  }

  override() {
    if (!!this.overrideUser().domain && !!this.overrideUser().username) {
      this.handleOverrideUser(this.overrideUser().username, this.overrideUser().domain);
      this.dialog()!.close();
    }
  }

  handleOverrideUser(username?: string, domain?: string) {
    const { useSSO } = globalConfig;

    if (username === undefined || domain === undefined) {
      setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    } else {
      setGlobalConfig({ userOverrideActive: true, userOverride: { username, domain } });
    }

    // Login with the new user
    if (useSSO) {
      this.appService
        .init()
        .then(() => {
          const { fullName } = getState(this.principalStore).principal;
          toast(`Welcome back ${fullName}!`, { duration: 2000 });
        })
        .catch(error => {
          toast.error('An error occured while overriding (SSO - intialize)', { duration: 2000 });
          setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
        });
    } else {
      login()
        .then(value => {
          if (value) {
            this.appService
              .init()
              .then(() => {
                const { fullName } = getState(this.principalStore).principal;
                toast(`Welcome back ${fullName}!`, { duration: 2000 });
              })
              .catch(error => {
                toast.error('An error occured while overriding (initialize)', { duration: 2000 });
                setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
              });
          }
        })
        .catch(error => {
          toast.error('An error occured while overriding (login)', { duration: 2000 });
          setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
        });
    }
  }
}

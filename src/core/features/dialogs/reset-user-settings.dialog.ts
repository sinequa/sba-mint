import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'reset-user-settings-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    DialogComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    DialogHeaderComponent,
    TranslocoPipe
  ],
  providers: [provideTranslocoScope({ scope: 'dialog', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'dialog.resetUserSettings.title' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <p>{{ 'dialog.resetUserSettings.message' | transloco }}</p>
      </DialogContent>

      <DialogFooter>
        <button variant="ghost" (click)="dialog.close()">
          {{ 'cancel' | transloco }}
        </button>

        <button variant="destructive" (click)="handleResetUserSettings()">
          {{ 'delete' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class ResetUserSettingsDialogComponent {
  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly translocoService = inject(TranslocoService);

  showModal() {
    this.dialog()!.showModal();
  }

  handleResetUserSettings() {
    this.dialog()!.close();
    this.userSettingsStore.reset().then(() => {
      const message = this.translocoService.translate('dialog.resetUserSettings.success');
      toast.success(message, { duration: 2000 });
    });
  }
}

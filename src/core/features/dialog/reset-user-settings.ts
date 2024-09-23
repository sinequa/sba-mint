import { Component, ElementRef, inject, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { UserSettingsStore } from "@sinequa/atomic-angular";
import { toast } from "ngx-sonner";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'reset-user-settings-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: "dialog", loader })],
  template: `
<dialog
  popover
  class="z-backdrop w-full max-w-md p-4 rounded-lg border border-neutral-200 shadow-2xl"
  #dialog>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">{{ 'dialog.resetUserSettings.title' | transloco }}</h1>
    <hr class="border-t" />
    <p>{{ 'dialog.resetUserSettings.message' | transloco }}</p>

    <div class="flex justify-end gap-2 mt-4">
      <button class="btn btn-ghost outline-none w-24" (click)="dialog.close()">
        {{ 'cancel' | transloco }}
      </button>

      <button class="btn bg-alert w-24" (click)="handleResetUserSettings()">
        {{ 'delete' | transloco }}
      </button>
    </div>
  </div>
</dialog>
`
})
export class ResetUserSettingsDialogComponent {
  readonly dialog = viewChild<ElementRef>('dialog');

  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly translocoService = inject(TranslocoService);

  showModal() {
    this.dialog()!.nativeElement.showModal();
  }

  handleResetUserSettings() {
    this.dialog()!.nativeElement.close();
    this.userSettingsStore.reset().then(() => {
      const message = this.translocoService.translate('dialog.resetUserSettings.success');
      toast.success(message, { duration: 2000 });
    });
  }

}
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { CCApp } from '@sinequa/atomic';
import {
  AppStore,
  AuditService,
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent
} from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';

export const AuditFeedbackType = 'UserFeedback_UserFeedback';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'feedback-dialog, feedbackdialog, FeedbackDialog',
  standalone: true,
  imports: [
    TranslocoPipe,
    FormsModule,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogFooterComponent,
    DialogTitleComponent,
    DialogContentComponent
  ],
  providers: [provideTranslocoScope({ scope: 'searchFeedback', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'searchFeedback.dialogTitle' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        @if (type()) {
          <p>{{ 'searchFeedback.' + type() + '.description' | transloco }}</p>
          <textarea
            class="mt-2 w-full rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
            type="text"
            autocomplete="off"
            spellcheck="false"
            [ngModel]="comment()"
            (ngModelChange)="comment.set($event)"></textarea>
        }
      </DialogContent>

      <DialogFooter>
        <button variant="secondary" (click)="dialog.close()">
          {{ 'cancel' | transloco }}
        </button>
        <button [disabled]="!comment()" (click)="submit()">
          {{ 'confirm' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class FeedbackDialogComponent {
  readonly auditService = inject(AuditService);
  readonly appStore = inject(AppStore);
  private readonly transloco = inject(TranslocoService);

  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  type = signal<string | undefined>(undefined);
  comment = signal<string>('');

  showModal(type: string) {
    this.type.set(type);
    this.dialog()!.showModal();
  }

  submit(): void {
    const { name } = getState(this.appStore) as CCApp;

    this.auditService.notify({
      type: AuditFeedbackType,
      detail: {
        app: name,
        message: this.type(),
        detail: this.comment()
      }
    });

    this.dialog()!.close();
    toast.success(this.transloco.translate('searchFeedback.feedbackSuccess'), { duration: 2000 });
  }
}

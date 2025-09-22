import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { DocumentListComponent, DocumentOverviewComponent, DocumentUploadComponent } from '@sinequa/assistant/chat';
import { ButtonComponent, DialogComponent, DialogContentComponent, DialogFooterComponent, DialogHeaderComponent, DialogTitleComponent } from '@sinequa/ui';

@Component({
  selector: 'assistant-upload, AssistantUpload',
  imports: [
    TranslocoPipe,
    DocumentOverviewComponent,
    DocumentUploadComponent,
    DocumentListComponent,
    ButtonComponent,
    DialogComponent,
    DialogContentComponent,
    DialogTitleComponent,
    DialogHeaderComponent,
    DialogFooterComponent
  ],
  template: `
    <section class="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow">
      <div class="flex items-center justify-between">
        <h3 class="pointer-events-none text-sm font-semibold text-gray-600">
          <i class="far fa-folder-open me-1"></i>
          {{ 'assistant.my-documents' | transloco }}
        </h3>
      </div>

      <sq-document-overview #documentOverview [disabledUpload]="false" (onUpload)="uploadDialog?.showModal()"> </sq-document-overview>
    </section>

    <dialog #uploadDialog>
      <DialogHeader>
        <DialogTitle>{{ 'assistant.upload' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent class="flex flex-col gap-4">
        <sq-document-upload />

        <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow">
          <div class="flex items-center">
            <h3 class="pointer-events-none grow text-sm font-semibold text-gray-600">
              <i class="far fa-folder-open me-1"></i>
              {{ 'assistant.uploaded' | transloco }}
            </h3>
            <button variant="ghost" [title]="'assistant.refresh' | transloco" [attr.aria-label]="'assistant.refresh' | transloco">
              <i class="fas fa-sync"></i>
            </button>
            <button
              variant="ghost"
              [title]="'assistant.delete-all' | transloco"
              [attr.aria-label]="'assistant.delete-all' | transloco"
              (click)="documentList?.deleteAllDocuments()">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <sq-document-list #documentList> </sq-document-list>
        </div>
      </DialogContent>

      <DialogFooter>
        <button decoration="outline" (click)="uploadDialog.close($event)">
          {{ 'close' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class AssistantUploadComponent {
  instanceId = input.required<string>();
}

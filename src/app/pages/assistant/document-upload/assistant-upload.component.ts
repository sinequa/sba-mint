import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { DocumentUploadComponent, DocumentOverviewComponent, DocumentListComponent } from '@sinequa/assistant/chat';
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

      <sq-document-overview #documentOverview [instanceId]="instanceId()" [disabledUpload]="false" (onUpload)="uploadDialog?.showModal()">
      </sq-document-overview>
    </section>

    <dialog #uploadDialog (closed)="documentOverview.updateUploadedDocumentsList()">
      <DialogHeader>
        <DialogTitle>{{ 'assistant.upload' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent class="flex flex-col gap-4">
        <sq-document-upload [instanceId]="instanceId()" />

        <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow">
          <div class="flex items-center">
            <h3 class="pointer-events-none grow text-sm font-semibold text-gray-600">
              <i class="far fa-folder-open me-1"></i>
              {{ 'assistant.uploaded' | transloco }}
            </h3>
            <button
              variant="ghost"
              [title]="'assistant.refresh' | transloco"
              [attr.aria-label]="'assistant.refresh' | transloco"
              (click)="documentList?.updateUploadedDocumentsList()">
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
          <sq-document-list #documentList [instanceId]="instanceId()"> </sq-document-list>
        </div>
      </DialogContent>

      <DialogFooter>
        <button variant="outline" (click)="uploadDialog.close($event)">
          {{ 'close' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class AssistantUploadComponent {
  instanceId = input.required<string>();
}

import { Component, viewChild } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { DocumentListComponent, DocumentUploadComponent } from "@sinequa/assistant/chat";
import {
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  type DialogInterface,
  DialogTitleComponent,
  FolderOpenIcon,
  SyncIcon,
  TrashIcon
} from "@sinequa/ui";

@Component({
  selector: "upload-dialog",
  imports: [
    TranslocoPipe,
    DocumentUploadComponent,
    DocumentListComponent,
    ButtonComponent,
    DialogComponent,
    DialogContentComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogFooterComponent,
    FolderOpenIcon,
    SyncIcon,
    TrashIcon
  ],
  template: `
    <div dialog #uploadDialog="dialog">
      <DialogContent class="mt-4 flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>{{ 'assistant.upload' | transloco }}</DialogTitle>
        </DialogHeader>

        <sq-document-upload #sqDocumentUpload />

        <div class="dark:bg-menu rounded-2xl border border-gray-200 p-4 shadow">
          <div class="text-muted-foreground flex items-center">
            <h3 class="pointer-events-none grow text-sm font-semibold">
              <FolderOpenIcon class="me-1" />
              {{ 'assistant.uploaded' | transloco }}
            </h3>
            <button variant="ghost" [title]="'assistant.refresh' | transloco" [attr.aria-label]="'assistant.refresh' | transloco">
              <SyncIcon />
            </button>
            <button
              variant="ghost"
              [title]="'assistant.delete-all' | transloco"
              [attr.aria-label]="'assistant.delete-all' | transloco"
              (click)="documentList?.deleteAllDocuments()">
              <TrashIcon />
            </button>
          </div>
          <sq-document-list #documentList></sq-document-list>
        </div>

        <DialogFooter class="mt-4">
          <button variant="outline" (click)="uploadDialog.close()">
            {{ 'close' | transloco }}
          </button>
        </DialogFooter>
      </DialogContent>
    </div>
  `,
  host: {
    class: "block fixed z-1000"
  }
})
export class UploadDialog implements DialogInterface {
  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  open() {
    this.dialog()?.open();
  }
}

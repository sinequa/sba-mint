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
  DialogTitleComponent
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
    DialogFooterComponent
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
          <sq-document-list #documentList></sq-document-list>
        </div>

        <DialogFooter class="mt-4">
          <button decoration="outline" (click)="uploadDialog.close()">
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

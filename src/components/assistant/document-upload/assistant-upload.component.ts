import { Component, inject, input } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";

import { DocumentOverviewComponent } from "@sinequa/assistant/chat";
import { DialogService, FolderOpenIcon } from "@sinequa/ui";

import { UploadDialog } from "./upload.dialog";

@Component({
  selector: "assistant-upload, AssistantUpload",
  imports: [TranslocoPipe, DocumentOverviewComponent, FolderOpenIcon],
  template: `
    <section class="border-foreground/10 rounded-2xl border p-4">
      <div class="text-muted-foreground flex items-center gap-2">        <FolderOpenIcon />
        <h3 class="pointer-events-none font-semibold">
          {{ 'assistant.my-documents' | transloco }}
        </h3>
      </div>

      <sq-document-overview #documentOverview [disabledUpload]="false" (onUpload)="openUploadDialog()"> </sq-document-overview>
    </section>
  `
})
export class AssistantUploadComponent {
  dialogService = inject(DialogService);

  instanceId = input.required<string>();

  openUploadDialog() {
    this.dialogService.open(UploadDialog);
  }
}

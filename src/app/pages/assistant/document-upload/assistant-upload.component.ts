import { Component, inject, input } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";

import { DocumentOverviewComponent } from "@sinequa/assistant/chat";
import { DialogService } from "@sinequa/ui";

import { UploadDialog } from "./upload.dialog";

@Component({
  selector: "assistant-upload, AssistantUpload",
  imports: [TranslocoPipe, DocumentOverviewComponent],
  template: `
    <section class="dark:bg-menu mt-6 rounded-2xl border border-gray-200 p-4 shadow">
      <div class="text-muted-foreground flex items-center justify-between">
        <h3 class="pointer-events-none font-semibold">
          <i class="far fa-folder-open me-1"></i>
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

import { Component, ElementRef, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from "@jsverse/transloco";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'edit-labels-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: "dialog", loader })],
  template: `
<dialog
  popover
  class="z-backdrop w-full max-w-md p-4 rounded-lg border border-neutral-200 shadow-2xl"
  #dialog>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">{{ 'dialog.editLabels.title' | transloco }}</h1>
    <hr class="border-t mb-2" />

    <div class="bg-blue-100 rounded p-3">
      <i class="fa-fw fas fa-circle-info"></i><span class="font-semibold mx-2">INFO</span>Press 'Enter' to add a new label that does not exist in the suggestions
    </div>
  </div>
</dialog>
`
})
export class EditLabelsComponent {
  readonly dialog = viewChild<ElementRef>('dialog');

  showModal() {
    this.dialog()!.nativeElement.showModal();
  }
}
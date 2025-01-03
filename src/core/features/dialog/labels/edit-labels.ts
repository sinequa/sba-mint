import { Component, ElementRef, inject, input, OnDestroy, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from "@jsverse/transloco";
import { Subscription } from "rxjs";

import { Article } from "@sinequa/atomic";
import { LabelsConfig, LabelService } from "@sinequa/atomic-angular";

import { LabelsFormComponent } from "./labels-form";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'edit-labels-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe, LabelsFormComponent],
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
      <i class="fa-fw fas fa-circle-info"></i><span class="font-semibold mx-2">INFO</span>{{'dialog.editLabels.info' | transloco}}
    </div>

    @if (!!labelsConfig()?.publicLabelsField) {
      <section class="flex flex-col gap-2">
        <p class="font-semibold">{{'dialog.editLabels.publicLabels' | transloco}}</p>
        @if (labelsConfig()!.allowPublicLabelsCreation) {
          <labels-form
            [article]="article()"
            [labelsField]="labelsConfig()?.publicLabelsField"
            [allowModification]="labelsConfig()?.allowPublicLabelsModification || false"
            [isPublic]="true" />
        }
      </section>
    }
    @if (!!labelsConfig()?.privateLabelsField) {
      <section class="flex flex-col gap-2">
        <p class="font-semibold">{{'dialog.editLabels.privateLabels' | transloco}}</p>
        <labels-form
          [article]="article()"
          [labelsField]="labelsConfig()?.privateLabelsField"
          [allowModification]="true"
          [isPublic]="false" />
      </section>
    }

    <div class="flex justify-end gap-2 mt-4">
      <button class="btn btn-tertiary outline-none w-24" (click)="dialog.close()">
        {{ 'dialog.editLabels.close' | transloco }}
      </button>
    </div>
  </div>
</dialog>
`
})
export class EditLabelsComponent implements OnDestroy {

  public readonly article = input.required<Article>();

  labelService = inject(LabelService);

  readonly dialog = viewChild<ElementRef>('dialog');

  protected readonly subscriptions = new Subscription();
  public readonly labelsConfig = signal<LabelsConfig | undefined>(undefined);

  showModal() {
    this.dialog()!.nativeElement.showModal();

    this.subscriptions.add(
      this.labelService.getLabelsConfig().subscribe(config => this.labelsConfig.set(config))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
import { Component, ElementRef, inject, input, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { Article } from '@sinequa/atomic';
import {
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  LabelsConfig,
  LabelService
} from '@sinequa/atomic-angular';

import { LabelsFormComponent } from './labels-form';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'labels-edit-dialog, labelseditdialog, LabelsEditDialog',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoPipe,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogFooterComponent,
    DialogTitleComponent,
    DialogContentComponent,
    LabelsFormComponent
  ],
  providers: [provideTranslocoScope({ scope: 'dialog', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'dialog.editLabels.title' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <div class="rounded bg-blue-100 p-3">
          <i class="fa-fw fas fa-circle-info"></i><span class="mx-2 font-semibold">INFO</span>{{ 'dialog.editLabels.info' | transloco }}
        </div>

        @if (!!labelsConfig()?.publicLabelsField) {
          <section class="flex flex-col gap-2">
            <p class="font-semibold">{{ 'dialog.editLabels.publicLabels' | transloco }}</p>
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
            <p class="font-semibold">{{ 'dialog.editLabels.privateLabels' | transloco }}</p>
            <labels-form [article]="article()" [labelsField]="labelsConfig()?.privateLabelsField" [allowModification]="true" [isPublic]="false" />
          </section>
        }
      </DialogContent>

      <DialogFooter>
        <button variant="secondary" (click)="dialog.close()">
          {{ 'dialog.editLabels.close' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class LabelsEditComponent implements OnDestroy {
  public readonly article = input.required<Article>();

  labelService = inject(LabelService);

  readonly dialog = viewChild<ElementRef>('dialog');

  protected readonly subscriptions = new Subscription();
  public readonly labelsConfig = signal<LabelsConfig | undefined>(undefined);

  showModal() {
    this.dialog()!.nativeElement.showModal();

    this.subscriptions.add(this.labelService.getLabelsConfig().subscribe(config => this.labelsConfig.set(config)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

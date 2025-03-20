import { Component, ElementRef, inject, input, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { Article } from '@sinequa/atomic';
import { LabelsConfig, LabelService } from '@sinequa/atomic-angular';

import { ButtonComponent, DialogComponent, DialogContentComponent, DialogFooterComponent, DialogHeaderComponent, DialogTitleComponent } from '@sinequa/ui';

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
  providers: [provideTranslocoScope({ scope: 'labelsEdit', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'labelsEdit.title' | transloco }}</DialogTitle>
        <p class="text-muted-foreground">
          <i class="fa-fw fas fa-circle-info"></i><span class="ps-1">{{ 'labelsEdit.info' | transloco }}</span>
        </p>
      </DialogHeader>

      <DialogContent>
        @if (!!labelsConfig()?.publicLabelsField) {
          @if (labelsConfig()!.allowPublicLabelsCreation) {
            <labels-form
              [article]="article()"
              [labelsField]="labelsConfig()?.publicLabelsField"
              [allowModification]="labelsConfig()?.allowPublicLabelsModification || false"
              [isPublic]="true" />
          }
        }
        @if (!!labelsConfig()?.privateLabelsField) {
          <labels-form [article]="article()" [labelsField]="labelsConfig()?.privateLabelsField" [allowModification]="true" [isPublic]="false" />
        }
      </DialogContent>

      <DialogFooter>
        <button (click)="dialog.close()">
          {{ 'labelsEdit.close' | transloco }}
        </button>
      </DialogFooter>
    </dialog>
  `
})
export class LabelsEditComponent implements OnDestroy {
  public readonly article = input.required<Article>();

  labelService = inject(LabelService);

  readonly dialog = viewChild<DialogComponent>(DialogComponent);

  protected readonly subscriptions = new Subscription();
  public readonly labelsConfig = signal<LabelsConfig | undefined>(undefined);

  showModal() {
    this.dialog()!.showModal();

    this.subscriptions.add(this.labelService.getLabelsConfig().subscribe(config => this.labelsConfig.set(config)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

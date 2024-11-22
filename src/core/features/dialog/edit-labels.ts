import { Component, computed, ElementRef, inject, input, model, OnDestroy, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from "@jsverse/transloco";
import { Article } from "@sinequa/atomic";
import { LabelsConfig, LabelService } from "@sinequa/atomic-angular";
import { Subscription, tap } from "rxjs";

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
      <i class="fa-fw fas fa-circle-info"></i><span class="font-semibold mx-2">INFO</span>{{'dialog.editLabels.info' | transloco}}
    </div>

    @if (!!labelsConfig()) {
      <p>{{'dialog.editLabels.publicLabels' | transloco}}</p>
      @if (labelsConfig()!.allowPublicLabelsCreation) {
        <input
          class="h-10 px-2 border w-full rounded-md bg-neutral-50 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
          type="text"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-label]="'dialog.editLabels.startTyping' | transloco"
          [attr.placeholder]="'dialog.editLabels.startTyping' | transloco"
          [(ngModel)]="newLabels().publicLabel"
          (keyup)="onKeyDown($event, true)"
        />
      }
      <div>
        @for (label of publicLabels(); track $index) {
          <span class="pill pill-sm pill-ghost bg-primary flex place-content-center items-center font-semibold text-white float-left m-1 cursor-pointer"
            (click)="removeLabel(label, true)">
            {{label}}
            <i class="ms-1 fa-fw far fa-circle-xmark"></i>
          </span>
        }
      </div>
      <p class="mt-2">{{'dialog.editLabels.privateLabels' | transloco}}</p>
      <input
        class="h-10 px-2 border w-full rounded-md bg-neutral-50 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
        type="text"
        autocomplete="off"
        spellcheck="false"
        [attr.aria-label]="'dialog.editLabels.startTyping' | transloco"
        [attr.placeholder]="'dialog.editLabels.startTyping' | transloco"
        [(ngModel)]="newLabels().privateLabel"
        (keyup)="onKeyDown($event, false)"
      />
      <div>
        @for (label of privateLabels(); track $index) {
          <span class="pill pill-sm pill-ghost bg-primary flex place-content-center items-center font-semibold text-white float-left m-1 cursor-pointer"
            (click)="removeLabel(label, false)">
            {{label}}
            <i class="ms-1 fa-fw far fa-circle-xmark"></i>
          </span>
        }
      </div>
    }
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

  readonly newLabels = model<{ publicLabel: string; privateLabel: string }>({ publicLabel: '', privateLabel: '' });

  public readonly publicLabels = signal<string[]>([]);
  public readonly privateLabels = signal<string[]>([]);

  showModal() {
    this.dialog()!.nativeElement.showModal();

    console.log('this.article', this.article());

    this.subscriptions.add(
      this.labelService.getLabelsConfig()
        .pipe(tap(labelsConfig => {
          this.labelsConfig.set(labelsConfig);
          if (labelsConfig?.publicLabelsField) {
            this.publicLabels.set((this.article() as any)[labelsConfig!.publicLabelsField!])
          }
          if (labelsConfig?.privateLabelsField) {
            this.privateLabels.set((this.article() as any)[labelsConfig!.privateLabelsField!])
          }
        }
        )).subscribe()
    );
  }

  onKeyDown(e: KeyboardEvent, isPublic: boolean): void {
    if (e.key === 'Enter') {
      const value = isPublic ? this.newLabels().publicLabel : this.newLabels().privateLabel;
      if (value.length) {
        this.subscriptions.add(
          this.labelService.add([value], [this.article().id], isPublic)
            .pipe(
              tap(() => {
                this.newLabels.set({
                  publicLabel: isPublic ? '' : this.newLabels().publicLabel,
                  privateLabel: !isPublic ? '' : this.newLabels().privateLabel
                });

                const labelSignal = isPublic ? this.publicLabels : this.privateLabels;
                labelSignal.set(labelSignal().concat([value]));
              })
            ).subscribe()
        );
      }
    }
  }

  removeLabel(label: string, isPublic: boolean): void {
    this.subscriptions.add(
      this.labelService.remove([label], [this.article().id], isPublic)
        .pipe(
          tap(() => {
            const labelSignal = isPublic ? this.publicLabels : this.privateLabels;
            labelSignal.set(labelSignal().filter(l => l !== label));
          })
        ).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
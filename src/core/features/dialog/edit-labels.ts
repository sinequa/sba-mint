import { NgClass } from "@angular/common";
import { Component, computed, effect, ElementRef, inject, input, model, OnDestroy, Signal, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from "@jsverse/transloco";
import { Article } from "@sinequa/atomic";
import { LabelsConfig, LabelService, cn, debouncedSignal } from "@sinequa/atomic-angular";
import { Subscription, tap } from "rxjs";

const DEBOUNCE_DELAY = 300;

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'edit-labels-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe, NgClass],
  providers: [provideTranslocoScope({ scope: "dialog", loader })],
  styles: `
#publicInput {
  anchor-name: --anchorPublic;
}

#privateInput {
  anchor-name: --anchorPrivate;
}

#publicInput {
  &:has(#public-popover:popover-open) {
    z-index: 5000;
    box-shadow: 0 0 0 max(100vh, 100vw) rgba(0, 0, 0, 0.3);
    border-radius: theme('borderRadius.DEFAULT') theme('borderRadius.DEFAULT') 0 0;
  }

  #public-popover::backdrop {
    background-color: transparent;
    backdrop-filter: none;
  }
}

#privateInput {
  &:has(#private-popover:popover-open) {
    z-index: 5000;
    box-shadow: 0 0 0 max(100vh, 100vw) rgba(0, 0, 0, 0.3);
    border-radius: theme('borderRadius.DEFAULT') theme('borderRadius.DEFAULT') 0 0;
  }

  #private-popover::backdrop {
    background-color: transparent;
    backdrop-filter: none;
  }
}

#public-popover {
  /* Select Firefox */
  @supports (-moz-appearance: none) {
    margin: calc(33.3333333333vh + 30px) 25vw;
    width: 50vw;
  }

  /* Select Safari */
  @supports (background: -webkit-named-image(i)) {
    margin: calc(33.3333333333vh + 30px) 25vw;
    width: 50vw;
  }

  position-anchor: --anchorPublic;
  width: anchor-size(width);
  top: anchor(bottom);
  left: anchor(left);
  margin: 0;
  padding: 0;
  border-radius: 0 0 6px 6px;
}

#private-popover {
  /* Select Firefox */
  @supports (-moz-appearance: none) {
    margin: calc(33.3333333333vh + 30px) 25vw;
    width: 50vw;
  }

  /* Select Safari */
  @supports (background: -webkit-named-image(i)) {
    margin: calc(33.3333333333vh + 30px) 25vw;
    width: 50vw;
  }

  position-anchor: --anchorPrivate;
  width: anchor-size(width);
  top: anchor(bottom);
  left: anchor(left);
  margin: 0;
  padding: 0;
  border-radius: 0 0 6px 6px;
}

  `,
  template: `
<dialog
  popover
  class="z-backdrop w-full max-w-md p-4 rounded-lg border border-neutral-200 shadow-2xl"
  (click)="dialog.close()"
  #dialog>
  <div class="flex flex-col gap-4" (click)="$event.stopPropagation()">
    <h1 class="text-xl font-bold">{{ 'dialog.editLabels.title' | transloco }}</h1>
    <hr class="border-t mb-2" />

    <div class="bg-blue-100 rounded p-3">
      <i class="fa-fw fas fa-circle-info"></i><span class="font-semibold mx-2">INFO</span>{{'dialog.editLabels.info' | transloco}}
    </div>

    @if (!!labelsConfig()) {
      <p>{{'dialog.editLabels.publicLabels' | transloco}}</p>
      @if (labelsConfig()!.allowPublicLabelsCreation) {
        <div id="publicInput">
          <input
            class="h-10 px-2 border w-full rounded-md bg-neutral-50 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
            type="text"
            autocomplete="off"
            spellcheck="false"
            [attr.aria-label]="'dialog.editLabels.startTyping' | transloco"
            [attr.placeholder]="'dialog.editLabels.startTyping' | transloco"
            [ngModel]="publicLabelInput()"
            (ngModelChange)="publicLabelInput.set($event)"
            (keyup)="onKeyDown($event, true)"
            (click)="onInputClick(true)"
          />
          <div popover id="public-popover" #publicLabelsPopover>
            <ul
              class="data-list-xs z-10 px-2 py-4 text-black bg-white rounded-b-lg shadow-md max-h-80 overflow-auto"
              aria-labelledby="dropdownDefaultButton"
              role="listbox"  
            >
              @for (label of suggestedPublicLabels(); track $index) {
                <li
                  role="option"
                  tabindex="0"
                >
                  <a
                    class="p-2 flex data-list-item items-baseline gap-2 cursor-pointer"
                    role="button"
                    aria-keyshortcuts="enter"
                    (keypress.enter)="itemClicked(label, true)"
                    (click)="itemClicked(label, true)"
                  >
                    {{ label }}
                  </a>
                </li>
              }
            </ul>
          </div>
        </div>
      }
      <div>
        @for (label of publicLabels(); track $index) {
          <span class="pill pill-sm pill-ghost bg-primary flex place-content-center items-center font-semibold text-white float-left m-1"
            [ngClass]="cn(
              labelsConfig()!.allowPublicLabelsModification && 'cursor-pointer'
            )"
            (click)="removeLabel(label, true)">
            {{label}}
            @if (labelsConfig()!.allowPublicLabelsModification) {
              <i class="ms-1 fa-fw far fa-circle-xmark"></i>
            }
          </span>
        }
      </div>
      <p class="mt-2">{{'dialog.editLabels.privateLabels' | transloco}}</p>
      <div id="privateInput">
        <input
          class="h-10 px-2 border w-full rounded-md bg-neutral-50 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
          type="text"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-label]="'dialog.editLabels.startTyping' | transloco"
          [attr.placeholder]="'dialog.editLabels.startTyping' | transloco"
          [ngModel]="privateLabelInput()"
          (ngModelChange)="privateLabelInput.set($event)"
          (keyup)="onKeyDown($event, false)"
          (click)="onInputClick(false)"
        />
        <div popover id="private-popover" #privateLabelsPopover>
          <ul
            class="data-list-xs z-10 px-2 py-4 text-black bg-white rounded-b-lg shadow-md max-h-80 overflow-auto"
            aria-labelledby="dropdownDefaultButton"
            role="listbox"
          >
            @for (label of suggestedPrivateLabels(); track $index) {
              <li
                role="option"
                tabindex="0"
              >
                <a
                  class="p-2 flex data-list-item items-baseline gap-2 cursor-pointer"
                  role="button"
                  aria-keyshortcuts="enter"
                  (keypress.enter)="itemClicked(label, false)"
                  (click)="itemClicked(label, false)"
                >
                  {{ label }}
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
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
  cn = cn;

  public readonly article = input.required<Article>();

  labelService = inject(LabelService);

  readonly dialog = viewChild<ElementRef>('dialog');

  protected readonly subscriptions = new Subscription();
  public readonly labelsConfig = signal<LabelsConfig | undefined>(undefined);

  readonly newLabels = model<{ publicLabel: string; privateLabel: string }>({ publicLabel: '', privateLabel: '' });

  public readonly publicLabelInput = signal<string>('');
  private readonly publicLabelsPopover = viewChild<ElementRef>('publicLabelsPopover');
  public readonly publicLabelsPopoverElement: Signal<HTMLDivElement> = computed(() => this.publicLabelsPopover()?.nativeElement);
  protected readonly debouncePublicLabelInputValue = debouncedSignal(this.publicLabelInput, DEBOUNCE_DELAY);

  public readonly privateLabelInput = signal<string>('');
  private readonly privateLabelsPopover = viewChild<ElementRef>('privateLabelsPopover');
  public readonly privateLabelsPopoverElement: Signal<HTMLDivElement> = computed(() => this.privateLabelsPopover()?.nativeElement);
  protected readonly debouncePrivateLabelInputValue = debouncedSignal(this.privateLabelInput, DEBOUNCE_DELAY);

  public readonly publicLabels = signal<string[]>([]);
  public readonly privateLabels = signal<string[]>([]);

  suggestedPublicLabels = signal<string[]>([]);
  suggestedPrivateLabels = signal<string[]>([]);

  constructor() {
    effect(() => { // public label input
      const value = this.debouncePublicLabelInputValue();
      this.debounced(value, true);
    });
    effect(() => { // private label input
      const value = this.debouncePrivateLabelInputValue();
      this.debounced(value, false);
    });
  }

  showModal() {
    this.dialog()!.nativeElement.showModal();

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

  onInputClick(isPublic: boolean): void {
    if (isPublic && this.suggestedPublicLabels().length) {
      this.publicLabelsPopoverElement().showPopover();
    }
    if (!isPublic && this.suggestedPrivateLabels().length) {
      this.privateLabelsPopoverElement().showPopover();
    }
  }

  itemClicked(label: string, isPublic: boolean): void {
    this.addLabel(label, isPublic);
  }

  onKeyDown(e: KeyboardEvent, isPublic: boolean): void {
    if (e.key === 'Enter') {
      const value = isPublic ? this.publicLabelInput() : this.privateLabelInput();
      this.addLabel(value, isPublic);
    }
  }

  protected debounced(text: string, isPublic: boolean): void {
    this.labelService.fetch(text, isPublic)
      .pipe(
        tap(labels => {
          if (isPublic) {
            this.suggestedPublicLabels.set(labels);
            labels.length
              ? this.publicLabelsPopoverElement().showPopover()
              : this.publicLabelsPopoverElement()?.hidePopover();
          } else {
            this.suggestedPrivateLabels.set(labels);
            labels.length
              ? this.privateLabelsPopoverElement().showPopover()
              : this.privateLabelsPopoverElement()?.hidePopover();
          }
        })
      ).subscribe();
  }

  addLabel(label: string, isPublic: boolean): void {
    if (label.length) {
      this.subscriptions.add(
        this.labelService.add([label], [this.article().id], isPublic)
          .pipe(
            tap(() => {
              if (isPublic) {
                this.publicLabelInput.set('');
                this.suggestedPublicLabels.set([]);
              } else {
                this.privateLabelInput.set('');
                this.suggestedPrivateLabels.set([]);
              }

              const labelSignal = isPublic ? this.publicLabels : this.privateLabels;
              labelSignal.set((labelSignal() || []).concat([label]));
            })
          ).subscribe()
      );
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
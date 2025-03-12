import { NgStyle } from '@angular/common';
import { afterRender, Component, computed, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Article, fetchLabels, guid, labels } from '@sinequa/atomic';
import { debouncedSignal } from '@sinequa/atomic-angular';

const DEBOUNCE_DELAY = 300;

@Component({
  selector: 'labels-form, labelsform, LabelsForm',
  standalone: true,
  imports: [FormsModule, NgStyle, TranslocoPipe],
  template: `
    <div class="anchor" [ngStyle]="{ 'anchor-name': anchor() }">
      <input
        class="h-10 w-full rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
        type="text"
        autocomplete="off"
        spellcheck="false"
        [attr.aria-label]="'dialog.editLabels.startTyping' | transloco"
        [attr.placeholder]="'dialog.editLabels.startTyping' | transloco"
        [ngModel]="labelInput()"
        (ngModelChange)="labelInput.set($event)"
        (keyup)="onKeyDown($event)"
        (click)="onInputClick()" />
      <div popover class="popover m-0 mt-2 border shadow-md" #LabelsPopover>
        <ul class="data-list-xs m-1 max-h-40 overflow-auto bg-white text-black" aria-labelledby="dropdownDefaultButton" role="listbox">
          @for (label of suggestedLabels(); track $index) {
            <li role="option" tabindex="0">
              <a
                class="data-list-item flex cursor-pointer items-baseline gap-2 p-2"
                role="button"
                aria-keyshortcuts="enter"
                (keypress.enter)="itemClicked(label)"
                (click)="itemClicked(label)">
                {{ label }}
              </a>
            </li>
          }
        </ul>
      </div>
    </div>
    <div class="my-2 flex flex-wrap">
      @for (label of labels(); track $index) {
        <span class="float-left m-1 flex select-none place-content-center items-center rounded-full bg-primary font-semibold text-white">
          {{ label }}
          @if (allowModification()) {
            <i class="fa-fw far fa-circle-xmark ms-1 cursor-pointer" (click)="removeLabel(label, isPublic())"></i>
          }
        </span>
      }
    </div>
  `,
  styles: `
    .anchor {
      &:has(.popover:popover-open) {
        z-index: 5000;
        border-radius: theme('borderRadius.DEFAULT') theme('borderRadius.DEFAULT') 0 0;
      }

      .popover::backdrop {
        background-color: transparent;
        backdrop-filter: none;
      }
    }

    .popover {
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

      width: anchor-size(width);
      top: anchor(bottom);
      left: anchor(left);
      padding: 0;
      border-radius: 6px;
    }
  `
})
export class LabelsFormComponent {
  article = input.required<Article>();
  isPublic = input(false);
  allowModification = input(false);
  labelsField = input<string | undefined>();

  anchor = signal<string>(`--${guid()}`);
  suggestedLabels = signal<string[]>([]);

  labelInput = signal<string>('');
  debouncedLabelInput = debouncedSignal(this.labelInput, DEBOUNCE_DELAY);

  popover = viewChild<ElementRef>('LabelsPopover');
  popoverElement = computed(() => this.popover()?.nativeElement);

  labels = signal<string[]>([]);

  constructor() {
    afterRender(() => {
      this.popoverElement().style.positionAnchor = this.anchor();
    });

    effect(
      () => {
        this.labels.set((this.article()[this.labelsField()! as keyof Article] as string[]) || []);
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      this.fetchLabels(this.debouncedLabelInput(), this.isPublic());
    });
  }

  itemClicked(label: string) {
    this.addLabel(label, this.isPublic());
  }

  onInputClick() {
    if (this.suggestedLabels().length === 0) return;
    this.popoverElement().showPopover();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addLabel(this.labelInput(), this.isPublic());
    }
  }

  async fetchLabels(text: string, isPublic: boolean) {
    const labels = await fetchLabels(text, isPublic);
    const unappliedLabels = labels.filter(label => !this.labels().some(l => l === label));
    this.suggestedLabels.set(unappliedLabels);
    labels.length ? this.popoverElement().showPopover() : this.popoverElement().hidePopover();
  }

  async addLabel(label: string, isPublic: boolean) {
    const l = this.labels();
    this.labels.set([...l, label]);
    await labels.add([label], [this.article().id], isPublic);
    this.labelInput.set('');
    this.suggestedLabels.set([]);
  }

  async removeLabel(label: string, isPublic: boolean) {
    this.labels.set(this.labels().filter(l => l !== label));
    await labels.remove([label], [this.article().id], isPublic);
  }
}

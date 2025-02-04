import { Component, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Basket, UserSettingsStore } from '@sinequa/atomic-angular';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'manage-collections-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe, DragDropModule],
  providers: [provideTranslocoScope({ scope: 'collection', loader })],
  template: `
    <dialog popover class="z-backdrop w-full max-w-md rounded-lg border border-neutral-200 p-4 shadow-2xl" #dialog>
      <div class="flex flex-col gap-4">
        <h1 class="text-xl font-bold">{{ 'collection.manageCollections' | transloco }}</h1>
        <hr class="mb-2 border-t" />

        <button class="btn btn-tertiary w-24 outline-none" (click)="reorder()">
          {{ (reordering() ? 'collection.save' : 'collection.reorderCollections') | transloco }}
        </button>

        <ul class="flex flex-col" cdkDropList [cdkDropListData]="tmpCollections" [cdkDropListDisabled]="!reordering()" (cdkDropListDropped)="dropped($event)">
          @for (collection of tmpCollections; track $index) {
            <li
              class="group flex h-10 cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none"
              tabindex="0"
              cdkDrag
              (click)="onClick(collection, $index)">
              @if (modifiedIndex() === undefined || modifiedIndex() !== $index) {
                <span class="grow">{{ collection.name }}</span>
                @if (!reordering()) {
                  <i class="fa-fw fa-regular fa-trash-can" (click)="$event.stopPropagation(); deleteCollection($index)"></i>
                } @else {
                  <i class="fa-fw fa-regular fa-bars"></i>
                }
              } @else {
                <div class="flex grow">
                  <input
                    #renameInput
                    class="h-10 w-full grow rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
                    type="text"
                    autocomplete="off"
                    spellcheck="false"
                    [attr.aria-label]="'collection.collectionName' | transloco"
                    [attr.placeholder]="'collection.collectionName' | transloco"
                    [ngModel]="collectionName()"
                    (ngModelChange)="collectionName.set($event)"
                    (blur)="onBlur()" />
                </div>
              }
            </li>
          }
        </ul>

        <div class="mt-4 flex justify-end gap-2">
          <button class="btn btn-tertiary flex justify-center px-3 py-2" tabindex="0" [attr.title]="'collection.save' | transloco" (click)="save()">
            {{ 'collection.save' | transloco }}
          </button>
          <button class="btn btn-tertiary flex justify-center px-3 py-2" tabindex="0" [attr.title]="'collection.cancel' | transloco" (click)="dialog.close()">
            {{ 'collection.cancel' | transloco }}
          </button>
        </div>
      </div>
    </dialog>
  `
})
export class ManageCollectionsDialog {
  collections = input.required<Basket[]>();

  private readonly userSettingsStore = inject(UserSettingsStore);
  readonly dialog = viewChild<ElementRef>('dialog');
  readonly renameInput = viewChild<ElementRef>('renameInput');
  collectionName = signal<string>('');
  modifiedIndex = signal<number | undefined>(undefined);
  reordering = signal<boolean>(false);

  tmpCollections: Basket[];

  constructor() {
    effect(() => {
      this.tmpCollections = this.collections().map(c => Object.assign({}, c));
    });
  }

  showModal() {
    this.dialog()!.nativeElement.showModal();
  }

  reorder(): void {
    this.reordering.set(!this.reordering());
  }

  dropped(drop: CdkDragDrop<Basket[]>) {
    if (drop.currentIndex === drop.previousIndex) {
      return;
    }
    this.tmpCollections.splice(drop.currentIndex, 0, this.tmpCollections.splice(drop.previousIndex, 1)[0]);
  }

  onClick(collection: Basket, index: number): void {
    if (this.reordering() || this.modifiedIndex() === index) return;

    this.collectionName.set(collection.name);
    this.modifiedIndex.set(index);
    setTimeout(() => {
      this.renameInput()?.nativeElement.focus();
    });
  }

  onBlur(): void {
    if (this.collectionName()) {
      const collection = this.tmpCollections[this.modifiedIndex()!];
      collection.name = this.collectionName();
    }
    this.modifiedIndex.set(undefined);
  }

  async save(): Promise<void> {
    await this.userSettingsStore.updateBaskets(this.tmpCollections);
    this.reordering.set(false);
    this.dialog()!.nativeElement.close();
  }

  async deleteCollection(index: number): Promise<void> {
    await this.userSettingsStore.deleteBasket(index);
  }

  async create(): Promise<void> {
    if (!this.collectionName()) return;
    await this.userSettingsStore.createBasket({ name: this.collectionName() });
    this.dialog()!.nativeElement.close();
  }
}

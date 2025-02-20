import { Component, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Basket, UserSettingsStore } from '@sinequa/atomic-angular';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DeleteCollectionDialog } from './delete-collection';

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
  imports: [FormsModule, TranslocoPipe, DragDropModule, DeleteCollectionDialog],
  providers: [provideTranslocoScope({ scope: 'collection', loader })],
  template: `
    <dialog popover class="z-backdrop w-full max-w-md rounded-lg border border-neutral-200 p-4 shadow-2xl" #dialog>
      <div class="flex flex-col gap-4">
        <h1 class="text-xl font-bold">{{ 'collection.manageCollections' | transloco }}</h1>
        <hr class="mb-2 border-t" />

        <ul class="flex flex-col" cdkDropList [cdkDropListData]="tmpCollections" (cdkDropListDropped)="dropped($event)">
          @for (collection of tmpCollections; track $index) {
            <li
              class="group flex h-10 cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none"
              tabindex="0"
              cdkDrag
              (click)="onClick(collection, $index)">
              @if (modifiedIndex() === undefined || modifiedIndex() !== $index) {
                <i class="fas fa-inbox"></i>
                <span class="grow">{{ collection.name }}</span>
                <i class="fa-fw fa-regular fa-trash-can text-alert" (click)="$event.stopPropagation(); deleteCollection(collection, $index)"></i>
                <i class="fa-fw fa-regular fa-bars"></i>
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
          @if (creating()) {
            <li
              class="group flex h-10 cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none"
              tabindex="0">
              <div class="flex grow">
                <input
                  #createInput
                  class="h-10 w-full grow rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
                  type="text"
                  autocomplete="off"
                  spellcheck="false"
                  [attr.aria-label]="'collection.collectionName' | transloco"
                  [attr.placeholder]="'collection.collectionName' | transloco"
                  [ngModel]="newCollectionName()"
                  (ngModelChange)="newCollectionName.set($event)"
                  (blur)="onBlurCreate()" />
              </div>
            </li>
          }
        </ul>

        <div class="mt-4 flex justify-end gap-2">
          <button
            class="btn btn-tertiary flex justify-center px-3 py-2"
            tabindex="0"
            [attr.title]="'collection.createCollection' | transloco"
            (click)="onCreate()">
            {{ (creating() ? 'collection.cancelCreation' : 'collection.createCollection') | transloco }}
          </button>
          <button class="btn btn-tertiary flex justify-center px-3 py-2" tabindex="0" [attr.title]="'collection.close' | transloco" (click)="dialog.close()">
            {{ 'collection.close' | transloco }}
          </button>
        </div>
      </div>
    </dialog>

    <delete-collection-dialog />
  `
})
export class ManageCollectionsDialog {
  collections = input.required<Basket[]>();

  private readonly userSettingsStore = inject(UserSettingsStore);
  readonly dialog = viewChild<ElementRef>('dialog');
  readonly renameInput = viewChild<ElementRef>('renameInput');
  readonly createInput = viewChild<ElementRef>('createInput');
  collectionName = signal<string>('');
  newCollectionName = signal<string>('');
  creating = signal<boolean>(false);
  modifiedIndex = signal<number | undefined>(undefined);

  readonly deleteCollectionDialog = viewChild(DeleteCollectionDialog);

  tmpCollections: Basket[];

  constructor() {
    effect(() => {
      this.tmpCollections = this.collections().map(c => Object.assign({}, c));
    });
  }

  showModal() {
    this.dialog()!.nativeElement.showModal();
  }

  dropped(drop: CdkDragDrop<Basket[]>) {
    if (drop.currentIndex === drop.previousIndex) {
      return;
    }
    this.tmpCollections.splice(drop.currentIndex, 0, this.tmpCollections.splice(drop.previousIndex, 1)[0]);
    this.save();
  }

  onClick(collection: Basket, index: number): void {
    if (this.modifiedIndex() === index) return;

    this.collectionName.set(collection.name);
    this.modifiedIndex.set(index);
    setTimeout(() => {
      this.renameInput()?.nativeElement.focus();
    });
  }

  onCreate(): void {
    if (this.creating()) return this.creating.set(false);

    this.creating.set(true);
    this.createInput()?.nativeElement.focus();
  }

  onBlur(): void {
    let modifiedName = false;
    if (this.collectionName()) {
      const collection = this.tmpCollections[this.modifiedIndex()!];
      modifiedName = collection.name !== this.collectionName();
      collection.name = this.collectionName();
    }
    this.modifiedIndex.set(undefined);
    if (modifiedName) this.save();
  }

  onBlurCreate(): void {
    if (this.newCollectionName()) {
      const collection: Basket = { name: this.newCollectionName() };
      this.userSettingsStore.createBasket(collection);
      this.newCollectionName.set('');
      this.creating.set(false);
    }
  }

  async save(): Promise<void> {
    await this.userSettingsStore.updateBaskets(this.tmpCollections);
  }

  deleteCollection(collection: Basket, index: number) {
    this.deleteCollectionDialog()?.showModal(collection, index);
  }

  async create(): Promise<void> {
    if (!this.collectionName()) return;
    await this.userSettingsStore.createBasket({ name: this.collectionName() });
  }
}

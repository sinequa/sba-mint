import { Component, effect, ElementRef, inject, input, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from "@jsverse/transloco";
import { Basket, UserSettingsStore } from "@sinequa/atomic-angular";
import {CdkDragDrop, DragDropModule} from "@angular/cdk/drag-drop";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'manage-collections-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe, DragDropModule],
  providers: [provideTranslocoScope({ scope: "collection", loader })],
  template: `
<dialog
  popover
  class="z-backdrop w-full max-w-md p-4 rounded-lg border border-neutral-200 shadow-2xl"
  #dialog>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">{{ 'collection.manageCollections' | transloco }} {{modifiedIndex()}}</h1>
    <hr class="border-t mb-2" />

    <button class="btn btn-tertiary outline-none w-24" (click)="reorder()">
      {{ reordering() ? 'collection.save' : 'collection.reorderCollections' | transloco }}
    </button>

    <ul class="flex flex-col" cdkDropList [cdkDropListData]="tmpCollections" [cdkDropListDisabled]="!reordering()" (cdkDropListDropped)="dropped($event)">
      @for (collection of tmpCollections; track $index) {
        <li
          class="flex h-10 gap-2 px-3 py-2 items-center rounded cursor-pointer hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none group"
          tabindex="0"
          cdkDrag
          (click)="onClick(collection, $index)"
        >
          @if (modifiedIndex() === undefined || modifiedIndex() !== $index) {
            <span class="grow">{{ collection.name }}</span>
          } @else {
            <div class="grow flex">
              <input
                class="grow h-10 px-2 border w-full rounded-md bg-neutral-50 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
                type="text"
                autocomplete="off"
                spellcheck="false"
                [attr.aria-label]="'collection.collectionName' | transloco"
                [attr.placeholder]="'collection.collectionName' | transloco"
                [ngModel]="collectionName()"
                (ngModelChange)="collectionName.set($event)"
              />
              <button 
                class="btn btn-tertiary flex justify-center px-3 py-2"
                tabindex="0"
                [attr.title]="'collection.save' | transloco"
                (click)="validateRename()"
              >
                <i class="fa-fw fa-regular fa-save"></i>
              </button>
              <button
                class="btn btn-tertiary flex justify-center px-3 py-2"
                tabindex="0"
                [attr.title]="'collection.cancel' | transloco"
                (click)="cancelRename()"
              >
                <i class="fa-fw fa-regular fa-times"></i>
              </button>
            </div>
          }
          @if (!reordering()) {
            <i class="fa-fw fa-regular fa-trash-can" (click)="$event.stopPropagation(); deleteCollection($index)"></i>
          } @else {
            <i class="fa-fw fa-regular fa-bars"></i>
          }
        </li>
      }
    </ul>

    <div class="flex justify-end gap-2 mt-4">
      <button
          class="btn btn-tertiary flex justify-center px-3 py-2"
          tabindex="0"
          [attr.title]="'collection.save' | transloco"
          (click)="save()"
      >
          {{ 'collection.save' | transloco }}
      </button>
      <button
          class="btn btn-tertiary flex justify-center px-3 py-2"
          tabindex="0"
          [attr.title]="'collection.cancel' | transloco"
          (click)="dialog.close()"
      >
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
  }

  validateRename(): void {
    const collection = this.tmpCollections[this.modifiedIndex()!];
    collection.name = this.collectionName();
    this.modifiedIndex.set(undefined);
  }

  cancelRename(): void {
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
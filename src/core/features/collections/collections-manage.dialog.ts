import { ChangeDetectorRef, Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { Basket, UserSettingsStore } from '@sinequa/atomic-angular';
import {
  ButtonComponent,
  DialogComponent,
  DialogContentComponent,
  DialogEvent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  InputComponent,
  ListItemComponent
} from '@sinequa/ui';

import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DeleteCollectionDialog } from './collections-delete.dialog';

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
  imports: [
    FormsModule,
    TranslocoPipe,
    DragDropModule,
    DeleteCollectionDialog,
    ButtonComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ListItemComponent,
    InputComponent
  ],
  providers: [provideTranslocoScope({ scope: 'collection', loader })],
  template: `
    <dialog #dialog>
      <DialogHeader>
        <DialogTitle>{{ 'collection.manageCollections' | transloco }}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        <ul role="list" class="flex flex-col" cdkDropList [cdkDropListData]="tmpCollections" (cdkDropListDropped)="dropped($event)">
          @for (collection of tmpCollections; track $index) {
            @if (modifiedIndex() === undefined || modifiedIndex() !== $index) {
              <li role="listitem" cdkDrag (click)="onClick(collection, $index)">
                <i class="fas fa-inbox"></i>
                <span class="grow">{{ collection.name }}</span>
                <i class="fa-fw fa-regular fa-trash-can text-alert" (click)="$event.stopPropagation(); deleteCollection(collection, $index)"></i>
                <i class="fa-fw fa-regular fa-bars"></i>
              </li>
            } @else {
              <input
                class="grow"
                #renameInput
                type="text"
                autocomplete="off"
                spellcheck="false"
                [attr.aria-label]="'collection.collectionName' | transloco"
                [attr.placeholder]="'collection.collectionName' | transloco"
                [ngModel]="collectionName()"
                (ngModelChange)="collectionName.set($event)"
                (keydown.enter)="onBlur($event)"
                (keydown.escape)="onBlur($event)"
                (blur)="onBlur($event)" />
            }
          }
          @if (creating()) {
            <span class="flex gap-2">
              <input
                #createInput
                class="h-10 grow rounded-md border bg-neutral-50 px-2 hover:bg-white hover:outline hover:outline-1 hover:outline-primary focus:bg-white focus:outline focus:outline-1 focus:outline-primary"
                type="text"
                autocomplete="off"
                spellcheck="false"
                [attr.aria-label]="'collection.collectionName' | transloco"
                [attr.placeholder]="'collection.collectionName' | transloco"
                [ngModel]="newCollectionName()"
                (ngModelChange)="newCollectionName.set($event)"
                (keydown.enter)="onBlurCreate()"
                (blur)="onBlurCreate()" />

              <button variant="outline" class="w-fit" tabindex="0" [attr.title]="'collection.cancelCreation' | transloco" (click)="onCreate()">
                {{ 'collection.cancelCreation' | transloco }}
              </button>
              <button tabindex="0" [attr.title]="'collection.save' | transloco" (click)="save()">
                {{ 'collection.save' | transloco }}
              </button>
            </span>
          }
        </ul>
      </DialogContent>

      <DialogFooter class="flex flex-col">
        @if (!creating()) {
          <button class="w-full" tabindex="0" [attr.title]="'collection.createCollection' | transloco" (click)="onCreate()">
            {{ 'collection.createCollection' | transloco }}
          </button>

          <button variant="outline" class="ms-auto" tabindex="0" [attr.title]="'collection.close' | transloco" (click)="dialog.close()">
            {{ 'close' | transloco }}
          </button>
        }
      </DialogFooter>
    </dialog>

    <delete-collection-dialog />
  `
})
export class ManageCollectionsDialog {
  // collections = input.required<Basket[]>();

  private readonly userSettingsStore = inject(UserSettingsStore);
  readonly dialog = viewChild<DialogComponent>(DialogComponent);
  readonly renameInput = viewChild<ElementRef>('renameInput');
  readonly createInput = viewChild<ElementRef>('createInput');
  collectionName = signal<string>('');
  newCollectionName = signal<string>('');
  creating = signal<boolean>(false);
  modifiedIndex = signal<number | undefined>(undefined);

  readonly deleteCollectionDialog = viewChild(DeleteCollectionDialog);

  tmpCollections: Basket[] = [];

  constructor(cdr: ChangeDetectorRef) {
    effect(() => {
      const baskets = this.userSettingsStore.baskets();
      this.tmpCollections = baskets.map(c => Object.assign({}, c));
      cdr.markForCheck();
    });
  }

  closed = output<DialogEvent>();

  open() {
    this.dialog()!.showModal();
  }

  showModal() {
    this.dialog()!.showModal();
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

  onBlur(e: Event): void {
    e.preventDefault();
    e.stopImmediatePropagation();
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
    this.tmpCollections.splice(index, 1);
  }

  async create(): Promise<void> {
    if (!this.collectionName()) return;
    await this.userSettingsStore.createBasket({ name: this.collectionName() });
  }
}

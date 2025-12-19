import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { afterNextRender, ChangeDetectorRef, Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ApplicationService, Basket, DeleteCollectionDialog, TranslocoDateImpurePipe, UserSettingsStore } from '@sinequa/atomic-angular';
import { ButtonComponent, InputComponent, ListItemComponent } from '@sinequa/ui';

@Component({
  selector: 'Collections',
  imports: [RouterModule, FormsModule, TranslocoPipe, DragDropModule, DeleteCollectionDialog, ButtonComponent, InputComponent, ListItemComponent],
  template: `
    <div class="layout-search overflow-auto">
      <div class="col-span-2 col-start-2">
        <h1 class="mt-6 mb-4 flex items-center gap-2 text-2xl font-semibold">
          <i class="fa-fw fas fa-inbox" aria-hidden></i>
          {{ 'myCollections' | transloco }}
        </h1>

        @if (creating()) {
          <span class="flex gap-2">
            <input
              #createInput
              type="text"
              autocomplete="off"
              spellcheck="false"
              [attr.aria-label]="'collections.collectionName' | transloco"
              [attr.placeholder]="'collections.collectionName' | transloco"
              [ngModel]="newCollectionName()"
              (ngModelChange)="newCollectionName.set($event)"
              (keydown.enter)="postCreate()"
              (keydown.escape)="$event.preventDefault(); onCreate()" />

            <button decoration="outline" class="w-fit" tabindex="0" [attr.title]="'collections.cancelCreation' | transloco" (click)="onCreate()">
              {{ 'collections.cancelCreation' | transloco }}
            </button>
            <button tabindex="1" [attr.title]="'collections.save' | transloco" [disabled]="!newCollectionName().trim()" (click)="postCreate()">
              {{ 'collections.save' | transloco }}
            </button>
          </span>
        } @else {
          <div class="row-reverse flex">
            <button tabindex="0" [attr.title]="'collections.createCollection' | transloco" (click)="onCreate()">
              {{ 'collections.createCollection' | transloco }}
            </button>
          </div>
        }

        <ul class="mt-4 flex flex-col gap-2" cdkDropList [cdkDropListData]="tmpCollections" (cdkDropListDropped)="dropped($event)">
          @for (collection of tmpCollections; track $index) {
            @if (modifiedIndex() === undefined || modifiedIndex() !== $index) {
              <!-- class=" rounded-md p-1 hover:cursor-pointer hover:bg-blue-50" -->
              <li
                class="group grid grid-cols-[min-content_auto_min-content_min-content_min-content] items-center"
                role="listitem"
                cdkDrag
                (click)="onClick(collection)">
                <i class="fas fa-inbox ps-2"></i>

                <span class="mx-2">{{ collection.name }}</span>

                <button
                  size="icon"
                  variant="ghost"
                  class="text-primary invisible group-hover:visible"
                  (click)="$event.stopPropagation(); onEdit(collection, $index)">
                  <i class="fa-fw far fa-pen-to-square" aria-hidden></i>
                </button>

                <button
                  size="icon"
                  variant="ghost"
                  class="text-destructive invisible group-hover:visible"
                  (click)="$event.stopPropagation(); deleteCollection(collection, $index)">
                  <i class="fa-fw far fa-trash" aria-hidden></i>
                </button>

                <button size="icon" variant="ghost">
                  <i class="fa-fw far fa-bars" aria-hidden></i>
                </button>
              </li>
            } @else {
              <input
                class="grow"
                #renameInput
                type="text"
                autocomplete="off"
                spellcheck="false"
                [attr.aria-label]="'collections.collectionName' | transloco"
                [attr.placeholder]="'collections.collectionName' | transloco"
                [ngModel]="collectionName()"
                (ngModelChange)="collectionName.set($event)"
                (keydown.enter)="onBlur($event)"
                (keydown.escape)="onBlur($event)"
                (blur)="onBlur($event)" />
            }
          }
        </ul>
      </div>
    </div>

    <delete-collection-dialog />
  `,
  host: {
    class: 'flex flex-col h-full w-full'
  },
  providers: [TranslocoDateImpurePipe]
})
export class CollectionsComponent {
  readonly router = inject(Router);
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly transloco = inject(TranslocoService);
  readonly applicationService = inject(ApplicationService);

  readonly renameInput = viewChild<ElementRef>('renameInput');
  readonly createInput = viewChild<ElementRef>('createInput');

  collectionName = signal<string>('');
  newCollectionName = signal<string>('');
  creating = signal<boolean>(false);
  modifiedIndex = signal<number | undefined>(undefined);

  readonly deleteCollectionDialog = viewChild(DeleteCollectionDialog);

  tmpCollections: Basket[] = [];

  constructor(cdr: ChangeDetectorRef) {
    afterNextRender(this.setTitle.bind(this));

    effect(() => {
      const baskets = this.userSettingsStore.baskets();
      this.tmpCollections = baskets.map(c => Object.assign({}, c));
      cdr.markForCheck();
    });

    this.transloco.langChanges$.subscribe(this.setTitle.bind(this));
  }

  dropped(drop: CdkDragDrop<Basket[]>) {
    if (drop.currentIndex === drop.previousIndex) {
      return;
    }
    this.tmpCollections.splice(drop.currentIndex, 0, this.tmpCollections.splice(drop.previousIndex, 1)[0]);
    this.save();
  }

  onClick(collection: Basket): void {
    this.router.navigate(['/search'], { queryParams: { b: collection.name } });
  }

  onEdit(collection: Basket, index: number): void {
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
    setTimeout(() => {
      this.createInput()?.nativeElement.focus();
    }, 1);
  }

  onBlur(e: Event): void {
    e.preventDefault();
    e.stopImmediatePropagation();
    let modifiedName = false;
    if (this.collectionName().trim()) {
      const collection = this.tmpCollections[this.modifiedIndex()!];
      modifiedName = collection.name !== this.collectionName();
      collection.name = this.collectionName().trim();
    }
    this.modifiedIndex.set(undefined);
    if (modifiedName) this.save();
  }

  postCreate(): void {
    if (!this.newCollectionName().trim()) return;

    const collection: Basket = { name: this.newCollectionName().trim() };
    this.userSettingsStore.createBasket(collection);
    this.newCollectionName.set('');
    this.creating.set(false);
  }

  deleteCollection(collection: Basket, index: number) {
    this.deleteCollectionDialog()?.open(collection, index);
  }

  async create(): Promise<void> {
    if (!this.collectionName()) return;
    await this.userSettingsStore.createBasket({ name: this.collectionName() });
  }

  async save(): Promise<void> {
    await this.userSettingsStore.updateBaskets(this.tmpCollections);
  }

  /**
   * Sets the page title to the translated "mySavedSearches" text.
   * Uses the transloco service to get the localized title and updates
   * the application title through the applicationService.
   * @private
   */
  private setTitle() {
    const title = this.transloco.translate('myCollections');
    this.applicationService.setTitle(title);
  }
}

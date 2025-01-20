import { Component, computed, ElementRef, inject, input, signal, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from "@jsverse/transloco";
import { Article } from "@sinequa/atomic";
import { Basket, UserSettingsStore } from "@sinequa/atomic-angular";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'add-to-collection-dialog',
  standalone: true,
  imports: [FormsModule, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: "collection", loader })],
  template: `
<dialog
  popover
  class="z-backdrop w-full max-w-md p-4 rounded-lg border border-neutral-200 shadow-2xl"
  #dialog>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-bold">{{ 'collection.addToCollection' | transloco }}</h1>
    <hr class="border-t mb-2" />

    <ul class="flex flex-col">
        @for (collection of collections(); track $index) {
          <li
            class="flex h-10 gap-2 px-3 py-2 items-center rounded cursor-pointer hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none group"
            tabindex="0" (click)="addToCollection(collection, $index)"
          >
            <i class="fa-fw fa-regular {{containsArticle(collection) ? 'fa-square-check' : 'fa-square'}}"></i>
            {{ collection.name }}
          </li>
        }
      
        @empty {
          <li class="text-neutral-500 text-center py-4">
            {{ 'collection.noCollections' | transloco }}
          </li>
        }
    </ul>

    <div class="flex justify-end gap-2 mt-4">
      <button class="btn btn-tertiary outline-none w-24" (click)="dialog.close()">
        {{ 'collection.close' | transloco }}
      </button>
    </div>
  </div>
</dialog>
`
})
export class AddToCollectionDialog {

  readonly article = input.required<Article>();
  private readonly userSettingsStore = inject(UserSettingsStore);
  readonly dialog = viewChild<ElementRef>('dialog');
  protected collections = computed<Basket[]>(() => this.userSettingsStore.baskets());

  showModal() {
    this.dialog()!.nativeElement.showModal();
  }

  containsArticle(collection: Basket): boolean {
    return (collection.ids || []).some(id => id === this.article().id)
  }

  async addToCollection(collection: Basket, collectionIndex: number): Promise<void> {
    if (this.containsArticle(collection)) { // remove it
      const index = collection.ids!.indexOf(this.article().id);
      collection.ids!.splice(index, 1);
    } else { // add it
      if (!collection.ids) collection.ids = [];
      collection.ids!.push(this.article().id);
    }
    await this.userSettingsStore.updateBasket(collection, collectionIndex);
  }
}
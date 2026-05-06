import { Component, computed, ElementRef, inject, input, output, signal, viewChild } from "@angular/core";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { notify } from "@sinequa/atomic";
import { SavedSearchesService, type SearchItem, UserSettingsStore } from "@sinequa/atomic-angular";
import {
  ButtonComponent,
  DropdownComponent,
  IconButtonComponent,
  InputComponent,
  PopoverComponent,
  PopoverContentComponent,
  StarIcon
} from "@sinequa/ui";

@Component({
  selector: "saved-search-popover, SavedSearchPopover, savedsearchpopover",
  imports: [
    TranslocoPipe,
    ButtonComponent,
    PopoverComponent,
    PopoverContentComponent,
    InputComponent,
    StarIcon,
    IconButtonComponent
  ],
  template: `
    @if (!savedSearch()) {
      <Popover #popover class="flex!" >
        <button
          variant="none"
          icon-button
          size="sm"

          [title]="'searchInput.saveSearch' | transloco"
          [attr.aria-label]="'searchInput.saveSearch' | transloco"
          (click)="openSavedSearch($event)">
          <StarIcon />
        </button>

        <PopoverContent class="min-w-xs" position="bottom-end" strategy="fixed">
          <div class="cursor-default">
            <label class="text-xl font-bold">{{ 'searches.saved.saveYourSearch' | transloco }}</label>
            <div class="py-4">
              <input
                #savedNameInput
                type="text"
                autocomplete="off"
                spellcheck="false"
                class="w-full p-2 hover:cursor-text"
                [value]="savedName()"
                (input)="savedName.set(savedNameInput.value)"
                [attr.aria-label]="'searches.saved.saveName' | transloco"
                [attr.placeholder]="'searches.saved.saveName' | transloco"
                (keydown.enter)="savedName().trim().length !== 0 && saveQuery($event, savedNameInput.value)" />
            </div>
            <div class="ml-auto flex justify-end gap-2">
              <button variant="outline" [title]="'cancel' | transloco" (click)="popover.close()">
                {{ 'cancel' | transloco }}
              </button>
              <button [title]="'confirm' | transloco" (click)="saveQuery($event, savedNameInput.value)" [disabled]="!savedName().trim()">
                {{ 'confirm' | transloco }}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    } @else {
      <button
        variant="none"
        icon-button
        size="sm"

        class="transition-transform duration-200 ease-in-out peer-disabled:opacity-50 hover:scale-110"
        [attr.title]="'searchInput.saveSearch' | transloco"
        [attr.aria-label]="'searchInput.saveSearch' | transloco"
        (click)="saveQuery($event)"
        (keydown.enter)="saveQuery($event)">
        <StarIcon solid class="animate-save" />
      </button>
    }
  `,
  host: {
    class: "flex"
  }
})
export class SavedSearchPopover {
  // "saved search" popover reference
  protected readonly popoverComponent = viewChild.required(PopoverComponent);
  // autocomplete dropdown reference
  protected readonly dropdownComponent = inject(DropdownComponent);
  protected readonly savedNameInputRef = viewChild<ElementRef<HTMLInputElement>>("savedNameInput");

  protected readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly savedSearchesService = inject(SavedSearchesService);
  protected readonly transloco = inject(TranslocoService);

  queryText = input<string>("");

  onSavedSearch = output<SearchItem | undefined>();

  // used by saved search
  protected readonly savedName = signal<string>("");

  /** Returns true if the current search (current input() + filters) is in the saved searches */
  protected readonly savedSearch = computed(() => this.userSettingsStore.getSavedSearch(this.queryText()));

  openSavedSearch(e: Event): void {
    // stop propagation to avoid the parent to manage the click event
    e.stopPropagation();
    // close the autocomplete dropdown
    this.dropdownComponent.close();

    // set the saved name to the current search input text
    this.savedName.set(this.queryText());

    // open the "saved search" popover
    this.popoverComponent().toggle(e);

    requestAnimationFrame(() => {
      this.savedNameInputRef()?.nativeElement.focus();
    });
  }

  protected saveQuery(event: Event, savedName?: string): void {
    event.stopPropagation();

    const savedSearch = this.savedSearch();
    if (savedSearch) {
      // no animation when unsaving
      const index = this.savedSearchesService.getSavedSearches().indexOf(savedSearch);
      if (index !== -1) {
        this.savedSearchesService.deleteSavedSearch(index);
        notify.success(this.transloco.translate("searches.saved.deleted"), { duration: 2000 });
      }
      this.onSavedSearch.emit(savedSearch);
    } else {
      this.savedSearchesService.saveSearch(savedName || this.savedName().trim());
      notify.success(this.transloco.translate("searches.saved.saved"), { duration: 2000 });
      this.popoverComponent().close();
    }
  }
}

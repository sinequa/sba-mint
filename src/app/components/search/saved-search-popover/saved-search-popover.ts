import { Component, signal, viewChild, ElementRef, input, output, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { DropdownComponent, ButtonComponent, InputComponent, PopoverComponent, PopoverContentComponent } from '@sinequa/ui';
import { UserSettingsStore, SavedSearchesService, type SearchItem } from '@sinequa/atomic-angular';

@Component({
  selector: 'saved-search-popover, SavedSearchPopover, savedsearchpopover',
  imports: [TranslocoPipe, ButtonComponent, PopoverComponent, PopoverContentComponent, InputComponent],
  template: `
    @if (!savedSearch()) {
      <Popover #popover class="rounded-lg border-neutral-300">
        <button
          variant="icon"
          size="xs"
          class="peer-disabled:opacity-50"
          [attr.title]="'searchInput.saveSearch' | transloco"
          [attr.aria-label]="'searchInput.saveSearch' | transloco"
          (click)="openSavedSearch($event)">
          <i class="fa-fw far fa-star" [class.animate-save]="saveAnimation()" aria-hidden="true"></i>
        </button>

        <PopoverContent class="min-w-xs p-2" position="bottom-end">
          <form class="cursor-default">
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
              <button decoration="outline" (click)="popover.close()">
                {{ 'cancel' | transloco }}
              </button>
              <button variant="primary" (click)="saveQuery($event, savedNameInput.value)" [disabled]="!savedName().trim()">
                {{ 'confirm' | transloco }}
              </button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    } @else {
      <button
        variant="icon"
        size="xs"
        class="peer-disabled:opacity-50"
        [attr.title]="'searchInput.saveSearch' | transloco"
        [attr.aria-label]="'searchInput.saveSearch' | transloco"
        (click)="saveQuery($event)"
        (keydown.enter)="saveQuery($event)">
        <i class="fa-fw fas fa-star" [class.animate-save]="saveAnimation()" aria-hidden="true"></i>
      </button>
    }
  `
})
export class SavedSearchPopover {
  // "saved search" popover reference
  protected readonly popoverComponent = viewChild.required(PopoverComponent);
  // autocomplete dropdown reference
  protected readonly dropdownComponent = inject(DropdownComponent);
  protected readonly savedNameInputRef = viewChild<ElementRef<HTMLInputElement>>('savedNameInput');

  protected readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly savedSearchesService = inject(SavedSearchesService);

  queryText = input<string>('');

  onSavedSearch = output<SearchItem | undefined>();

  // used by saved search
  protected readonly savedName = signal<string>('');
  protected readonly saveAnimation = signal<boolean>(false);

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

    if (this.savedSearch()) {
      // no animation when unsaving
      this.onSavedSearch.emit(this.savedSearch());
    } else {
      this.savedSearchesService.saveSearch(this.savedName().trim());
      this.saveAnimation.set(true);

      setTimeout(() => this.saveAnimation.set(false), 1000);
      this.popoverComponent().close();
    }
  }
}

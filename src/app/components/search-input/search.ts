import { Component, computed, ElementRef, forwardRef, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { cn, SearchIconComponent, XMarkIConComponent } from '@sinequa/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const inputSearchVariants = cva(
  'group border-input text-secondary focus-within:ring-ring/50 hover:border-ring hover:ring-ring/50 flex min-w-0 items-center gap-1 border px-2 py-3 align-middle font-sans text-sm leading-5 font-normal transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-muted h-9 rounded-3xl',
        basic: 'h-8 rounded-lg',
        prompt: 'bg-muted h-9 gap-4 rounded-xl'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

type InputSearchVariants = VariantProps<typeof inputSearchVariants>;

@Component({
  selector: 'Search',
  standalone: true,
  imports: [SearchIconComponent, XMarkIConComponent],
  template: `
    <SearchIcon class="text-foreground size-4 rotate-0 transition-[rotate] duration-500 group-focus-within:rotate-90" />
    <input
      #search
      class="peer placeholder:text-muted-foreground focus:text-foreground grow outline-none"
      type="combobox"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      aria-controls="search-suggestions"
      aria-owns="search-suggestions"
      [placeholder]="placeholder()"
      [attr.aria-keyshortcuts]="hotkey()"
      [attr.aria-activeDescendant]="activeDescendant()"
      [attr.aria-expanded]="isExpanded()"
      (keydown.arrowdown)="arrowdown($event)"
      (keydown.arrowup)="arrowup($event)"
      (keydown.enter)="enter($event)"
      (keydown.escape)="escape($event)"
      (blur)="blur()"
      (focus)="focus()"
      (input)="onChange(search.value)" />
    <!--
    (keydown)="handleKeydown($event)"
    -->

    <!-- TODO: Problem with tab focus erase button captures it when input is empty -->
    <button
      variant="icon"
      class="text-foreground mr-1 rotate-0 transform opacity-0 transition-[rotate,opacity] duration-500 peer-not-placeholder-shown:rotate-90 peer-not-placeholder-shown:cursor-pointer peer-not-placeholder-shown:opacity-100 peer-placeholder-shown:pointer-events-none"
      (click)="clearSearch($event)">
      <XMark class="size-4" />
    </button>

    <ng-content />
  `,
  host: {
    '[class]': "cn(variants(), disabled() && 'pointer-events-none opacity-50')"
  },
  styles: `
    :host {
      /* clears the 'x' from Internet Explorer */
      input[type='search']::-ms-clear,
      input[type='search']::-ms-reveal {
        appearance: none;
        width: 0;
        height: 0;
      }
      /* clears the 'x' from Chrome */
      input[type='search']::-webkit-search-decoration,
      input[type='search']::-webkit-search-cancel-button,
      input[type='search']::-webkit-search-results-button,
      input[type='search']::-webkit-search-results-decoration {
        appearance: none;
      }
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true
    }
  ]
})
export class SearchComponent implements ControlValueAccessor {
  cn = cn;
  searchElement = viewChild<ElementRef<HTMLInputElement>>('search');

  placeholder = input<string>('Search...');
  disabled = input<boolean>(false);
  hotkey = input<string>('shift+/');

  class = input<string>();
  variant = input<InputSearchVariants['variant']>('default');
  activeDescendant = input<string>('');

  readonly onArrowUp = output();
  readonly onArrowDown = output();
  readonly onEnter = output();
  readonly onEscape = output();
  readonly onFocus = output();
  readonly onBlur = output();

  isExpanded = signal(false);

  variants = computed(() => {
    return inputSearchVariants({ variant: this.variant(), class: this.class() });
  });

  clearSearch(e: Event) {
    const searchEl = this.searchElement()?.nativeElement;
    if (searchEl) {
      searchEl.value = '';
      searchEl.focus();
    }
    this.onChange('');
  }

  // handleKeydown(e: KeyboardEvent) {
  //   if (e.key === 'Escape') {
  //     e.preventDefault();
  //     this.searchElement()?.nativeElement.blur();
  //   }
  // }

  // #region ControlValueAccessor

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    const searchEl = this.searchElement()?.nativeElement;
    if (searchEl) {
      searchEl.value = value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // #endregion ControlValueAccessor

  // #region Keyboard mapping

  arrowup(e: Event): void {
    e.preventDefault();
    this.onArrowUp.emit();
  }

  arrowdown(e: Event): void {
    e.preventDefault();
    this.onArrowDown.emit();
  }

  enter(e: Event): void {
    e.preventDefault();
    this.onEnter.emit();
  }

  escape(e: Event): void {
    e.preventDefault();
    this.onEscape.emit();
  }

  focus(): void {
    this.onFocus.emit();
    this.isExpanded.set(true);
  }

  blur(): void {
    this.onBlur.emit();
    this.isExpanded.set(false);
  }

  // #endregion Keyboard mapping
}

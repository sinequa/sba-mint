import { Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import type { Article } from '@sinequa/atomic';
import { DrawerService, DrawerStackService } from '@sinequa/atomic-angular';
import { ButtonComponent } from '@sinequa/ui';

import type { PreviewNavbarConfig } from './navbar';

@Component({
  selector: 'preview-navbar-extended, PreviewNavbarExtended, previewnavbarextended',
  imports: [TranslocoPipe, ButtonComponent],
  template: `
    @if (config().showSearchButton && article()) {
      <div class="ml-auto *:flex *:items-center *:gap-2 *:text-nowrap">
        @if (isExtended()) {
          <button decoration="outline" (click)="drawerStack.extend()">
            <i class="fa-fw far fa-eye-slash"></i>
            {{ 'preview.hideSearch' | transloco }}
          </button>
        } @else {
          <button (click)="drawerStack.extend()">
            <i class="fa-fw far fa-eye"></i>
            {{ 'preview.searchInDocument' | transloco }}
          </button>
        }
      </div>
    }
  `,
  host: {
    class: 'contents'
  }
})
export class PreviewNavbarExtendedComponent {
  article = input.required<Partial<Article> | undefined>();
  config = input.required<PreviewNavbarConfig>();

  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly drawerService = inject(DrawerService);

  readonly isExtended = this.drawerService.isExtended;
}

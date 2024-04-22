import { Injectable, Type, inject, signal } from '@angular/core';
import { ArticleType } from "@/app/types/articles";

import { BackdropService } from './components/backdrop/backdrop.service';

export type ArticleTypeMap = {
  articleType: ArticleType;
  previewComponentType: Type<unknown>;
  articleComponentType: Type<unknown>;
  articleLightComponentType: Type<unknown>;
};

@Injectable()
export class DrawerService {
  public readonly isOpened = signal(false);
  public readonly isExtended = signal(false);

  private readonly backdrop = inject(BackdropService);

  public open(): void {
    this.isOpened.set(true);
  }

  public close(): void {
    this.collapse();
    this.isOpened.set(false);
  }

  public toggle(): void {
    this.isOpened() ? this.close() : this.open();
  }

  public extend(): void {
    this.isExtended.set(true);
    this.backdrop.show();
  }

  public collapse(): void {
    this.backdrop.hide();
    this.isExtended.set(false);
  }

  public toggleExtension(): void {
    this.isExtended() ? this.collapse() : this.extend();
  }
}

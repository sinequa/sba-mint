import { ArticleType } from "@/app/types/articles";
import { Injectable, Type, inject } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { BackdropService } from './components/backdrop/backdrop.service';

export type ArticleTypeMap = {
  articleType: ArticleType;
  previewComponentType: Type<unknown>;
  articleComponentType: Type<unknown>;
  articleLightComponentType: Type<unknown>;
};

@Injectable()
export class DrawerService {
  public readonly isOpened = new BehaviorSubject<boolean>(false);
  public readonly isExtended = new BehaviorSubject<boolean>(false);

  private readonly backdrop = inject(BackdropService);

  public open(): void {
    this.isOpened.next(true);
  }

  public close(): void {
    this.collapse();
    this.isOpened.next(false);
  }

  public toggle(): void {
    this.isOpened.getValue() ? this.close() : this.open();
  }

  public extend(): void {
    this.isExtended.next(true);
    this.backdrop.show();
  }

  public collapse(): void {
    this.backdrop.hide();
    this.isExtended.next(false);
  }

  public toggleExtension(): void {
    this.isExtended.getValue() ? this.collapse() : this.extend();
  }
}

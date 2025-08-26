import { Component, computed, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { BookmarkButtonComponent, MetadataComponent, MissingTermsComponent, TranslocoDateImpurePipe, SourceComponent } from '@sinequa/atomic-angular';
import { BadgeComponent, CardComponent, CardContentComponent, CardFooterComponent, CardHeaderComponent } from '@sinequa/ui';

import { CardMenuComponent } from '../menu';
import { RecordCard } from '../record/record-card';

@Component({
  selector: 'slide-card, slidecard, SlideCard',
  imports: [
    BookmarkButtonComponent,
    TranslocoDateImpurePipe,
    TranslocoPipe,
    MissingTermsComponent,
    MetadataComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    BadgeComponent,
    CardMenuComponent,
    SourceComponent
  ],
  templateUrl: './slide-card.html',
  host: {
    '(document:keydown.shift.t)': 'isLineClamped.set(!isLineClamped())'
  }
})
export class SlideCard extends RecordCard {
  thumbnailFailed = signal(false);

  protected override docformatMetadata = computed(() => {
    return this.article().docformat ?? this.article().doctype;
  });
}

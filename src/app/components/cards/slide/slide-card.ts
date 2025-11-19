import { Component, computed, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { BookmarkButtonComponent, MetadataComponent, MissingTermsComponent, SourceComponent, TranslocoDateImpurePipe } from '@sinequa/atomic-angular';
import { BadgeComponent, CardComponent, CardContentComponent } from '@sinequa/ui';

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
    CardContentComponent,
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

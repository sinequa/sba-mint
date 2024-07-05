import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { PreviewData } from '@sinequa/atomic';
import { Article as A } from "@sinequa/atomic";
import { AppStore, MetadataComponent, PreviewService, SplitPipe } from '@sinequa/atomic-angular';

import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { PreviewActionsComponent } from '../actions/preview-actions';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

type Article = A & {
  [key: string]: string[] | undefined;
};

@Component({
  selector: 'app-preview-default',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    SlicePipe,
    SplitPipe,
    PreviewNavbarComponent,
    MetadataComponent,
    PreviewActionsComponent,
    SourceIconComponent,
    TranslocoPipe
  ],
  templateUrl: './preview-default.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'grow flex flex-col overflow-hidden'
  },
  styleUrl: './preview-default.component.scss'
})
export class PreviewDefaultComponent implements OnDestroy {
  public iframe = viewChild<ElementRef<HTMLIFrameElement>>('preview');

  public readonly previewData = input.required<PreviewData>();
  public readonly article = computed(() => this.previewData()?.record as Article);
  public readonly previewUrl = computed(() =>
    this.previewData()?.documentCachedContentUrl ?
      this.sanitizer.bypassSecurityTrustResourceUrl(window.location.origin + this.previewData().documentCachedContentUrl) :
      undefined
  );

  public labels = inject(AppStore).getLabels();

  public readonly hasLabels = computed(() => {
    const publicLabels = this.article()[this.labels.public];
    const privateLabels = this.article()[this.labels.private];
    return (publicLabels && publicLabels.length > 0) || (privateLabels && privateLabels.length > 0);
  });

  readonly headerCollapsed = signal<boolean>(false);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly previewService = inject(PreviewService);

  private readonly sub = new Subscription();

  constructor() {
    effect(() => {
      if (!this.iframe()) return;

      this.previewService.setIframe(this.iframe()!.nativeElement.contentWindow);
    });

    effect(() => {
      if (!this.previewData()) return;

      this.previewService.setPreviewData(this.previewData());
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

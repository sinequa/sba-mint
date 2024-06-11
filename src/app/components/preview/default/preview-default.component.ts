import { DatePipe, JsonPipe, NgClass, SlicePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { PreviewData } from '@sinequa/atomic';
import { MetadataComponent, SplitPipe } from '@sinequa/atomic-angular';

import { AuthorComponent } from '@/app/components/author/author.component';
import { PreviewService } from '@/app/services/preview';
import { AppStore } from '@/app/stores';
import { Article } from "@/app/types/articles";

import { SourceIconComponent } from '../../source-icon/source-icon.component';
import { PreviewActionsComponent } from "../actions/preview-actions";
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-default',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    SlicePipe,
    SplitPipe,
    PreviewNavbarComponent,
    AuthorComponent,
    MetadataComponent,
    PreviewActionsComponent,
    SourceIconComponent,
    JsonPipe
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

import { Inject, Injectable, inject } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Subject } from "rxjs";

import { PreviewData } from "@sinequa/atomic";
import { HIGHLIGHTS, InlineWorker, PreviewHighlight } from "@sinequa/atomic-angular";

import { SelectionStore } from "@/app/stores";
import { ApplicationStore, Extract } from "@/stores";

import { ExtractsLocationService } from "./extracts-location.service";
import { getState } from "@ngrx/signals";

type ExtractsLocations = Extract & {
  text: string // HTML text
}

@Injectable()
export class PreviewService {
  applicationStore = inject(ApplicationStore);
  selectionStore = inject(SelectionStore);

  extractsLocationService = inject(ExtractsLocationService);
  sanitizer = inject(DomSanitizer);

  // ! worker
  onMessage = new Subject<unknown>();
  worker: InlineWorker;

  protected previewData: PreviewData;
  protected iframe: Window | null;

  extracts = ["matchlocations","extractslocations","matchingpassages"];
  entities = ["company","geo","person"];

  constructor(
    @Inject(HIGHLIGHTS) public highlights: PreviewHighlight[]) {
    this.extractsLocationService.onMessage.subscribe((message) => {
      if (message.data.extracts.length === 0) return;
      const extracts: Extract[] = message.data.extracts.map((item: ExtractsLocations) => ({
        ...item,
        text: this.sanitizer.bypassSecurityTrustHtml(item.text)
      }));

      this.applicationStore.updateExtracts(this.previewData.record.id, extracts);

    });

    window.addEventListener('message', (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'ready') {
        this.sendMessage({ action: "init", highlights: highlights });
        if (this.previewData) {
          this.getHtml("extractslocations", this.previewData);
        }
      }

      if (message.type === 'get-html-results') {
        const { id } = getState(this.selectionStore)
        if (id) {
          if (this.extractsLocationService.worker) {
            // const data = this.previewData.get(id)!;
            this.extractsLocationService.worker.postMessage({ id, extracts: message.data, data: this.previewData });
          } else {
            // const data = this.previewData.get(id)!;
            const extracts = this.fetchExtracts(id, message.data, this.previewData);
            this.applicationStore.updateExtracts(this.previewData.record.id, extracts);

          }
        }
      }
    });
  }

  setIframe(iframe: Window | null) {
    this.iframe = iframe;
  }
  setPreviewData(data: PreviewData) {
    this.previewData = data;
  }

  sendMessage(message: unknown) {
    if (this.iframe) {
      this.iframe!.postMessage(message);
    }
  }

  getHtml(highlight: string, data: PreviewData) {
    // Generate the list of items we want to retrieve
    const ids = data.highlightsPerCategory[highlight]?.values[0]?.locations.map(
      (_, i) => `${highlight}_${i}`
    );

    if (ids?.length) {
      this.sendMessage({ action: 'get-html', ids });
    }
  }

  private fetchExtracts(id: string, extracts: string[], data: PreviewData): Extract[] {
    const type = "extractslocations";

    // extracts contains the html of extracts in chronological order
    // locations contains the list of start positions sorted by score
    const locations = data.highlightsPerCategory["extractslocations"]?.values[0]?.locations || [];

    // first extract all the extracts locations
    let extractslocations = locations.map((l, relevanceIndex) => ({
      startIndex: l.start,
      relevanceIndex
    })) as ExtractsLocations[];

    // sort them by start index
    extractslocations.sort((a, b) => a.startIndex - b.startIndex);

    // then extract the text of each extract
    extractslocations = extractslocations.map((ex, textIndex) => ({
      ...ex,
      textIndex: textIndex,
      text: extracts[textIndex] || "",
      id: `${type}_${textIndex}`,
    }));

    // then sanitize the text and remove empty extracts
    const _extracts = extractslocations.filter(item => item.text.trim().length > 0).map(item => ({
      ...item,
      text: this.sanitizer.bypassSecurityTrustHtml(item.text)
    }));

    // finally sort them by relevance index
    _extracts.sort((a, b) => a.relevanceIndex - b.relevanceIndex);

    return _extracts;
  }

  zoomIn() {
    this.sendMessage({ action: "zoom-in" });
  }

  zoomOut() {
    this.sendMessage({ action: "zoom-out" });
  }

  toggle(extracts: boolean, entities: boolean) {
    const extractsHighlights = extracts ? this.highlights.filter( h => this.extracts.includes(h.name)) : [];
    const entitiesHighlights = entities ? this.highlights.filter( h => this.entities.includes(h.name)) : [];
    const highlights = [...extractsHighlights, ...entitiesHighlights];

    this.sendMessage({ action: "highlight", highlights });
  }

}
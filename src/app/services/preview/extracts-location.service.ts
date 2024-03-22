import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { PreviewData } from '@sinequa/atomic';
import { InlineWorker } from '@sinequa/atomic-angular';

import { Extract } from "@/stores";

type ExtractsLocations = Extract & {
  text: string // HTML text
}

@Injectable()
export class ExtractsLocationService implements OnDestroy {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage = new Subject<{ data: { id: string, extracts: ExtractsLocations[] } }>();
  worker: InlineWorker;

  constructor() {
    this.worker = new InlineWorker(() => {
      // START OF WORKER THREAD CODE
      const getAllExtracts = ({ id, extracts, data }: { id: string, extracts: string[], data: PreviewData }) => {
        // id       : is the id of the record
        // extracts : contains the html of extracts in chronological order
        // data     : contains the preview data of the record

        // when data is undefined, it means that the preview data is not available
        // in this case, we return an empty array of extracts
        if (!data) {
          // @ts-expect-error worker can't see methods of this class
          this.postMessage({
            id,
            extracts: []
          });

          return;
        }

        const type = "extractslocations";

        // extracts contains the html of extracts in chronological order
        // locations contains the list of start positions sorted by score
        const locations = data.highlightsPerCategory[type]?.values[0]?.locations || [];

        // first extract all the extracts locations
        let extractslocations = locations.map(function (l, relevanceIndex) {
          return ({
            startIndex: l.start,
            relevanceIndex
          })
        }
        ) as ExtractsLocations[];

        // sort them by start index
        extractslocations.sort((a, b) => a.startIndex - b.startIndex);

        // then extract the text of each extract
        extractslocations = extractslocations.map(function (ex, textIndex) {
          return Object.assign(ex, {
            textIndex: textIndex,
            text: extracts[textIndex] || "",
            id: `${type}_${textIndex}`,
          })
        }
        );

        // remove empty extracts
        const _extracts = extractslocations.filter(item => item.text.trim().length > 0);


        // finally sort them by relevance index
        _extracts.sort((a, b) => a.relevanceIndex - b.relevanceIndex);

        // this is from DedicatedWorkerGlobalScope ( because of that we have postMessage and onmessage methods )
        // and it can't see methods of this class
        // @ts-expect-error worker can't see methods of this class
        this.postMessage({
          id,
          extracts: _extracts
        });
      };

      // @ts-expect-error ignore
      this.onmessage = (evt) => {
        getAllExtracts(evt.data);
      };
      // END OF WORKER THREAD CODE
    });

    this.worker.onmessage().subscribe(event => {
      console.log("worker response", event);
      this.onMessage.next(event);
    });

    this.worker.onerror().subscribe((data) => {
      console.error("worker error:", data);
    });
  }


  ngOnDestroy(): void {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}

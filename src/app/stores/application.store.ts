import { computed } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { SafeHtml } from '@angular/platform-browser';
import { withDevtools } from "@angular-architects/ngrx-toolkit";

export type Extract = {
  id: string,
  text: SafeHtml, // Sanitized HTML text
  startIndex: number, // this is the start index of the extracts within the Document Text
  relevanceIndex: number, // 0 the most relevant to N the less relevant
  textIndex: number // index of the extract in the text. e.g 0 is the first extract displayed in the document
}

export type ApplicationState = {
  assistantReady: boolean,
  ready: boolean,
  extracts: Map<string, Extract[]>,
}

const intialState: ApplicationState = {
  assistantReady: false,
  ready: false,
  extracts: new Map(),
};

export const ApplicationStore = signalStore(
  // providing store at the root level
  { providedIn: 'root' },
  withDevtools('Application'),
  withState(intialState),
  withComputed(({extracts}) => ({
    extractsCount: computed(() => extracts().size),
  })),
  withMethods((store) => ({
    updateAssistantReady() {
      patchState(store, (state) => ({ ...state, assistantReady: true }));
    },
    updateReadyState() {
      patchState(store, (state) => ({ ...state, ready: true }));
    },
    updateExtracts(id: string, extracts: Extract[]) {
      patchState(store, (state) => {
        const extractsMap = state.extracts;
        extractsMap.set(id, extracts);
        return { ...state, extracts: extractsMap}
      })
    },
    getExtracts(id: string) {
      return store.extracts().get(id);
    }
  }))
);
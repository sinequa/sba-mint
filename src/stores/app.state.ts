import { SafeHtml } from '@angular/platform-browser';

export type Extract = {
  id: string,
  text: SafeHtml, // Sanitized HTML text
  startIndex: number, // this is the start index of the extracts within the Document Text
  relevanceIndex: number, // 0 the most relevant to N the less relevant
  textIndex: number // index of the extract in the text. e.g 0 is the first extract displayed in the document
}

export type AppState = {
  extracts: Map<string, Extract[]>,
}

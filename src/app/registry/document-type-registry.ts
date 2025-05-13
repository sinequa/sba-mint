import { Type } from '@angular/core';

import { Article } from '@sinequa/atomic';
import { PreviewComponent } from '../components/preview/preview';
import { SlideCard } from '../components/cards/slide/slide-card';
import { RecordCard } from '../components/cards/record/record-card';

// Define the default document type, should be linked to default article and preview components
// This document type is used when the document type is not recognized
export const DEFAULT_DOCUMENT_TYPE = 'default';
// Define the record key that contains the document type
// Special care about typo and case sensitivity
export const DOCUMENT_TYPE_RECORD_KEY = 'docformat';

export type DocumentTypeMap = {
  documentTypes: string[];
  articleComponent: Type<unknown>;
  previewComponent: Type<unknown>;
};

// Define the mapping between document types and components
// Keep it sorted by docType length in descending order so
// that the most specific document type is matched first
export const documentTypeMap: DocumentTypeMap[] = [
  {
    documentTypes: [DEFAULT_DOCUMENT_TYPE],
    articleComponent: RecordCard,
    previewComponent: PreviewComponent
  },
  // --- Add new document types here ---
  {
    documentTypes: ['pptx', 'ppt', 'powerpoint'],
    articleComponent: SlideCard,
    previewComponent: PreviewComponent
  }
  // ---
];

export function getComponentsForArticle(article: Article): DocumentTypeMap {
  return getComponentsForDocumentType(article[DOCUMENT_TYPE_RECORD_KEY]);
}

export function getComponentsForDocumentType(documentType?: string): DocumentTypeMap {
  if (documentType) {
    const type = documentTypeMap.find(dtm => dtm.documentTypes.includes(documentType.toLocaleLowerCase()));
    if (type) return type;
  }

  return documentTypeMap.find(dtm => dtm.documentTypes.includes(DEFAULT_DOCUMENT_TYPE))!;
}

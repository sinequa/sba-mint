import { Type } from "@angular/core";

import { Article } from "@sinequa/atomic";

import { ArticleDefaultComponent } from "@/core/components/article/default/article-default.component";
import { ArticleSlideComponent } from "@/core/components/article/slide/article-slide.component";
import { PreviewDefaultComponent } from "@/core/components/preview/default/preview-default.component";
import { PreviewSlideComponent } from "@/core/components/preview/slide/preview-slide.component";

// Define the default document type, should be linked to default article and preview components
// This document type is used when the document type is not recognized
export const DEFAULT_DOCUMENT_TYPE = 'default';
// Define the record key that contains the document type
// Special care about typo and case sensitivity
export const DOCUMENT_TYPE_RECORD_KEY = 'doctype';

export type DocumentTypeMap = {
  documentType: string;
  articleComponent: Type<unknown>;
  previewComponent: Type<unknown>;
}

// Define the mapping between document types and components
// Keep it sorted by docType length in descending order so
// that the most specific document type is matched first
export const documentTypeMap: DocumentTypeMap[] = [
  {
    documentType: DEFAULT_DOCUMENT_TYPE,
    articleComponent: ArticleDefaultComponent,
    previewComponent: PreviewDefaultComponent
  },
  // --- Add new document types here ---
  {
    documentType: 'PowerPoint',
    articleComponent: ArticleSlideComponent,
    previewComponent: PreviewSlideComponent
  }
  // ---
].sort((a, b) => b.documentType.length - a.documentType.length);

export function getComponentsForArticle(article: Article): DocumentTypeMap {
  return getComponentsForDocumentType(article[DOCUMENT_TYPE_RECORD_KEY]);
}

export function getComponentsForDocumentType(documentType?: string): DocumentTypeMap {
  if (documentType) {
    const type = documentTypeMap.find((dtm) => dtm.documentType === documentType);

    if (type) return type;
  }

  return documentTypeMap.find((dtm) => dtm.documentType === DEFAULT_DOCUMENT_TYPE)!;
}

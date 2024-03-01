import { Article as A } from "@sinequa/atomic";

export type ArticleType = 'default' | 'person' | 'matter' | 'slide';

export type ArticleMetadata = {
  value: string;
  display?: string;
  count?: number;
}

export interface Article extends A {
  value?: string;
  type?: ArticleType;
  parentFolder?: string;
  geo?: ArticleMetadata[];
  company?: ArticleMetadata[];
  person?: ArticleMetadata[];
}

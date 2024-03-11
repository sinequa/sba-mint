import { Article as A } from "@sinequa/atomic";
import { ArticleType } from "./ArticleType";
import { ArticleMetadata } from "./ArticleMetadata";


export interface Article extends A {
  value?: string;
  type?: ArticleType;
  parentFolder?: string;
  geo?: ArticleMetadata[];
  company?: ArticleMetadata[];
  person?: ArticleMetadata[];
}

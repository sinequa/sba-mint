import { Article as A } from "@sinequa/atomic";
import { ArticleMetadata } from "./ArticleMetadata";
import { ArticleType } from "./ArticleType";


export interface Article extends A {
  value?: string;
  type?: ArticleType;
  parentFolder?: string;
  geo?: ArticleMetadata[];
  company?: ArticleMetadata[];
  person?: ArticleMetadata[];
  queryDuplicates?: Article[];
  $queryName?: string;
}

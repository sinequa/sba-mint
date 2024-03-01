import { Article } from "./article.type";

export type SlideArticle = Article & {
  thumbnailUrl: string;
};

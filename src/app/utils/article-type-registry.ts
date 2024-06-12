import { ArticleDefaultComponent } from '@/app/components/article/default/article-default.component';
import { PreviewDefaultComponent } from '@/app/components/preview/default/preview-default.component';
import { ArticleType, ArticleTypeMap } from "@/app/types/articles";

export const articleTypesMap: ArticleTypeMap[] = [
  {
    articleType: 'default',
    previewComponentType: PreviewDefaultComponent,
    articleComponentType: ArticleDefaultComponent,
  },
  {
    articleType: 'matter',
    previewComponentType: PreviewDefaultComponent,
    articleComponentType: ArticleDefaultComponent,
  },
  {
    articleType: 'slide',
    previewComponentType: PreviewDefaultComponent,
    articleComponentType: ArticleDefaultComponent,
  }
];

export function getTypeMapForArticleType(articleType: ArticleType): ArticleTypeMap {
  return articleTypesMap.find((typeMap) => typeMap.articleType === articleType)!;
}

export function getTypeMapForArticleSTab(tab: string): ArticleTypeMap | undefined {
  return articleTypesMap.find((typeMap) => typeMap.articleType === tab);
}

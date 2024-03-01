import { Type } from '@angular/core';
import { ArticleDefaultLightComponent } from '@mint/components/article/default-light/article-default-light.component';
import { ArticleDefaultComponent } from '@mint/components/article/default/article-default.component';
import { ArticlePersonLightComponent } from '@mint/components/article/person-light/article-person-light.component';
import { ArticlePersonComponent } from '@mint/components/article/person/article-person.component';
import { PreviewDefaultComponent } from '@mint/components/preview/default/preview-default.component';
import { PreviewPersonComponent } from '@mint/components/preview/person/preview-person.component';
import { ArticleType } from '@mint/types/articles/article.type';

export type ArticleTypeMap = {
  articleType?: ArticleType;
  previewComponentType?: Type<unknown>;
  articleComponentType?: Type<unknown>;
  articleLightComponentType?: Type<unknown>;
};

export const articleTypesMap: ArticleTypeMap[] = [
  {
    articleType: 'default',
    previewComponentType: PreviewDefaultComponent,
    articleComponentType: ArticleDefaultComponent,
    articleLightComponentType: ArticleDefaultLightComponent
  },
  {
    articleType: 'person',
    previewComponentType: PreviewPersonComponent,
    articleComponentType: ArticlePersonComponent,
    articleLightComponentType: ArticlePersonLightComponent
  },
  {
    articleType: 'matter',
    previewComponentType: PreviewDefaultComponent,
    articleComponentType: ArticleDefaultComponent,
    articleLightComponentType: ArticleDefaultLightComponent
  },
  {
    articleType: 'slide',
    previewComponentType: PreviewDefaultComponent,
    articleComponentType: ArticleDefaultComponent,
    articleLightComponentType: ArticleDefaultLightComponent
  }
];

export function getTypeMapForArticleType(articleType: ArticleType): ArticleTypeMap {
  return articleTypesMap.find((typeMap) => typeMap.articleType === articleType)!;
}

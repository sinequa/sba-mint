import { ArticleDefaultLightComponent } from '@/app/components/article/default-light/article-default-light.component';
import { ArticleDefaultComponent } from '@/app/components/article/default/article-default.component';
import { ArticlePersonLightComponent } from '@/app/components/article/person-light/article-person-light.component';
import { ArticlePersonComponent } from '@/app/components/article/person/article-person.component';
import { PreviewDefaultComponent } from '@/app/components/preview/default/preview-default.component';
import { PreviewPersonComponent } from '@/app/components/preview/person/preview-person.component';
import { ArticleType, ArticleTypeMap } from "@/app/types/articles";

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

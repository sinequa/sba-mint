import { Type } from '@angular/core';
import { ArticleType } from "./ArticleType";


export type ArticleTypeMap = {
  articleType?: ArticleType;
  previewComponentType?: Type<unknown>;
  articleComponentType?: Type<unknown>;
  articleLightComponentType?: Type<unknown>;
};

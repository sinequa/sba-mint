import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { InfinityScrollDirective, SelectArticleOnClickDirective } from '@sinequa/atomic-angular';

import { ArticleDefaultSkeletonComponent } from '@/core/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@/core/components/article/default/article-default.component';
import { FiltersComponent } from '@/core/components/filters/filters.component';
import { DidYouMeanComponent } from '@/core/features/did-you-mean/did-you-mean.component';
import { SortSelectorComponent } from '@/core/features/sort-selector/sort-selector.component';
import { MoreFiltersComponent } from "../../../../core/components/filters/more-filters/more-filters.component";
import { SearchAllComponent } from '../all/search-all.component';

@Component({
  selector: 'app-search-facets',
  standalone: true,
  imports: [
    NgClass,
    SelectArticleOnClickDirective,
    FiltersComponent,
    ArticleDefaultComponent,
    ArticleDefaultSkeletonComponent,
    SortSelectorComponent,
    DidYouMeanComponent,
    InfinityScrollDirective,
    MoreFiltersComponent
  ],
  templateUrl: './search-facets.component.html',
  styleUrl: './search-facets.component.scss'
})
export class SearchFacetsComponent extends SearchAllComponent { }

import { Component } from '@angular/core';
import { SkeletonDirective } from 'toolkit';

@Component({
  selector: 'app-article-slide-skeleton',
  standalone: true,
  imports: [SkeletonDirective],
  templateUrl: './article-slide-skeleton.component.html',
  host: {
    class: 'article pointer-events-none flex-col p-0'
  }
})
export class ArticleSlideSkeletonComponent {}

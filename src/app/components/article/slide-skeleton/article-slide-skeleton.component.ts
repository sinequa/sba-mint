import { Component } from '@angular/core';
import { SkeletonDirective } from 'toolkit';

@Component({
  selector: 'app-article-slide-skeleton',
  standalone: true,
  imports: [SkeletonDirective],
  templateUrl: './article-slide-skeleton.component.html',
  styleUrl: './article-slide-skeleton.component.scss'
})
export class ArticleSlideSkeletonComponent { }

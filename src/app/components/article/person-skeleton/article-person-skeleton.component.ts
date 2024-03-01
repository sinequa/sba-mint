import { Component } from '@angular/core';
import { SkeletonDirective } from 'toolkit';

@Component({
  selector: 'app-article-person-skeleton',
  standalone: true,
  imports: [SkeletonDirective],
  templateUrl: './article-person-skeleton.component.html',
  styleUrl: './article-person-skeleton.component.scss'
})
export class ArticlePersonSkeletonComponent { }

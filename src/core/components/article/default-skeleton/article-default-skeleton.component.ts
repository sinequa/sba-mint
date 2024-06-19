import { Component } from '@angular/core';
import { SkeletonDirective } from 'toolkit';

@Component({
  selector: 'app-article-default-skeleton',
  standalone: true,
  imports: [SkeletonDirective],
  templateUrl: './article-default-skeleton.component.html',
  styleUrl: './article-default-skeleton.component.scss'
})
export class ArticleDefaultSkeletonComponent { }

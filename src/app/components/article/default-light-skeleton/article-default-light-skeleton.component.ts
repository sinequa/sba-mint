import { Component } from '@angular/core';
import { SkeletonDirective } from 'toolkit';

@Component({
  selector: 'app-article-default-light-skeleton',
  standalone: true,
  imports: [SkeletonDirective],
  templateUrl: './article-default-light-skeleton.component.html',
  styleUrl: './article-default-light-skeleton.component.scss'
})
export class ArticleDefaultLightSkeletonComponent { }

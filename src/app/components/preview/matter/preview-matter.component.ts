import { Component, Input } from '@angular/core';

import { ArticlePersonLightComponent } from '@/app/components/article/person-light/article-person-light.component';
import { Article } from "@/app/types/articles";
import { PanelDirective } from 'toolkit';

import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-matter',
  standalone: true,
  imports: [PreviewNavbarComponent, PanelDirective, ArticlePersonLightComponent],
  templateUrl: './preview-matter.component.html',
  styleUrl: './preview-matter.component.scss'
})
export class PreviewMatterComponent {
  @Input() public article: Partial<Article> | undefined;

  protected partners: Partial<Article>[] = [
    { value: 'Jenny Wilson', type: 'person' }
  ];
  protected managers: Partial<Article>[] = [
    { value: 'Jane Cooper', type: 'person' }
  ];
  protected collaborators: Partial<Article>[] = [
    { value: 'Billie Beatty', type: 'person' },
    { value: 'Bryan Runolfsson', type: 'person' },
    { value: 'Rhonda Bernhard', type: 'person' },
    { value: 'Guy Hawkins', type: 'person' },
    { value: 'Troy Hermiston', type: 'person' }
  ];
  protected clients: Partial<Article>[] = [
    { value: 'Kristin Watson', type: 'person' }
  ];
  protected federals: Partial<Article>[] = [
    { value: 'Darrell Steward', type: 'person' }
  ];
}

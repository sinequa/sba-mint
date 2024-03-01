import { Component, input } from '@angular/core';
import { SlideArticle } from '@mint/types/articles/slide.type';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-slide',
  standalone: true,
  imports: [PreviewNavbarComponent],
  templateUrl: './preview-slide.component.html',
  styleUrl: './preview-slide.component.scss'
})
export class PreviewSlideComponent {
  public slide = input.required<SlideArticle | Partial<SlideArticle> | undefined>({ alias: 'article' });
}

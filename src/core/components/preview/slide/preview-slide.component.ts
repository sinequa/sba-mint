import { Component, input } from '@angular/core';

import { Article } from '@sinequa/atomic';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-slide',
  standalone: true,
  imports: [PreviewNavbarComponent],
  templateUrl: './preview-slide.component.html',
  styleUrl: './preview-slide.component.scss'
})
export class PreviewSlideComponent {
  public slide = input.required<Partial<Article> | undefined>({ alias: 'article' });
}

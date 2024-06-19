import { Component, input } from '@angular/core';

import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';
import { Article } from '@sinequa/atomic';

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

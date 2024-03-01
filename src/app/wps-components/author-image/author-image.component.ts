import { NgClass } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { PersonArticle } from '@mint/types/articles/person.type';

/**
 * Component to display the image of a PersonArticle.
 * You can specify a custom class for the image with the `imgClass` input.
 * You can also specify a fallback component using the `ng-content` projection.
 * 
 * @example Classic usage
 * ```html
 * <wps-author-image [person]="person" [imgClass]="'author-image'" />
 * ```
 * 
 * @example With fallback icon
 * ```html
 * <wps-author-image [person]="person">
 *   <i class="fa-fw fa-regular fa-user-circle" />
 * </wps-author-image>
 * ```
 */
@Component({
  selector: 'wps-author-image',
  standalone: true,
  imports: [NgClass],
  templateUrl: './author-image.component.html',
  styleUrl: './author-image.component.scss'
})
export class WpsAuthorImageComponent {
  public readonly person = input<PersonArticle>();
  public readonly imgClass = input<string>();

  protected readonly pictureUrl = computed(() => this.person()?.employeePhotoURL);
  protected readonly imgLoadFailed = signal(false);

  protected imgLoadingFailed(): void {
    this.imgLoadFailed.set(true);
  }
}

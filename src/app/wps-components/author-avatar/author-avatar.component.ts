import { PersonArticle } from '@/app/types';
import { NgClass } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';


/**
 * Component to display the image of a PersonArticle.
 * You can specify a custom class for the image with the `imgClass` input.
 * You can also specify a fallback component using the `ng-content` projection.
 *
 * @example Classic usage
 * ```html
 * <author-avatar [person]="person" [imgClass]="'author-avatar'" />
 * ```
 *
 * @example With fallback icon
 * ```html
 * <author-avatar [person]="person">
 *   <i class="fa-fw fa-regular fa-user-circle" />
 * </author-avatar>
 * ```
 */
@Component({
  selector: 'author-avatar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './author-avatar.component.html',
  styleUrl: './author-avatar.component.scss'
})
export class AuthorAvatarComponent {
  person = input.required<Partial<PersonArticle> | undefined>();
  className = input<string>();
  useImage = input<boolean>(false);

  withImage = signal(this.useImage());
  imageUrl = computed(() => this.person()?.employeePhotoURL );
  initials = computed(() => {

    const { employeeFullName = '' } = this.person() as PersonArticle;

    if(employeeFullName) {
      const initials = employeeFullName
        .split(' ')
        .filter( word => word[0] === word[0].toUpperCase() )
        .map( word => word[0] )
        .join('');

      return initials.slice(0, 3);
    }
    return '';
  })

  protected readonly imgLoadFailed = signal(false);

  constructor() {
    effect(() => {
      if(this.initials().length === 0) {
        this.withImage.set(true);
      }
    }, {allowSignalWrites: true})
  }
}

import { PersonArticle } from '@/app/types';
import { NgClass } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { AvatarInitialsComponent } from "./avatar-initials";


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
    templateUrl: './author-avatar.component.html',
    // eslint-disable-next-line @angular-eslint/no-host-metadata-property
    imports: [NgClass, AvatarInitialsComponent]
})
export class AuthorAvatarComponent {
  person = input.required<Partial<PersonArticle> | undefined>();
  className = input<string>();

  imageUrl = computed(() => this.person()?.employeePhotoURL );
  initials = computed(() => {

    const { employeeFullName = '' } = this.person() as PersonArticle || {};
    const separator = employeeFullName.includes('@') ? '.' : ' ';

    if(employeeFullName) {
      const initials = employeeFullName
        .split(separator)
        .filter( word => word[0] && (word[0] === word[0].toUpperCase()) )
        .map( word => word[0] )
        .join('');

      return initials.slice(0, 3);
    }
    return '';
  })

  protected readonly imgLoadFailed = signal(false);
}

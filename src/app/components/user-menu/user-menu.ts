import { Component, computed, inject, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { logout, setGlobalConfig } from '@sinequa/atomic';
import { OverrideUserDialogComponent, PrincipalStore, ResetUserSettingsDialogComponent, UserSettingsStore } from '@sinequa/atomic-angular';

import {
  AvatarComponent,
  AvatarFallbackComponent,
  AvatarImageComponent,
  ChevronRightIconComponent,
  FlagEnglishIconComponent,
  FlagFrenchIconComponent,
  HorizontalDividerComponent,
  MenuComponent,
  MenuContentComponent,
  MenuItemComponent,
  UserIcon
} from '@sinequa/ui';

@Component({
  selector: 'app-user-menu',
  imports: [
    FormsModule,
    MenuComponent,
    MenuContentComponent,
    MenuItemComponent,
    HorizontalDividerComponent,
    TranslocoPipe,
    OverrideUserDialogComponent,
    ResetUserSettingsDialogComponent,
    FlagEnglishIconComponent,
    FlagFrenchIconComponent,
    UserIcon,
    ChevronRightIconComponent,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent
  ],
  templateUrl: './user-menu.html',
  providers: [provideTranslocoScope('user-menu')]
})
export class UserMenuComponent {
  readonly menus = viewChildren(MenuComponent);
  readonly overrideUserDialog = viewChild(OverrideUserDialogComponent);
  readonly resetUserSettingsDialog = viewChild(ResetUserSettingsDialogComponent);

  private readonly router = inject(Router);
  private readonly principalStore = inject(PrincipalStore);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly transloco = inject(TranslocoService);

  readonly user = computed(() => {
    const principal = getState(this.principalStore).principal;
    return principal;
  });

  readonly initials = computed(() => {
    const principal = this.user();
    const separator = principal.fullName ? ' ' : '.';
    return (principal.fullName || principal.name || '')
      .split(separator)
      .filter(word => word[0] && word[0] === word[0].toUpperCase())
      .map(word => word[0])
      .join('')
      .slice(0, 3);
  });

  readonly allowUserOverride = computed(() => this.principalStore.allowUserOverride());
  readonly isOverridingUser = computed(() => this.principalStore.isOverridingUser());

  changeLanguage(lang: string) {
    this.userSettingsStore.updateLanguage(lang);

    if (this.transloco.getActiveLang() !== lang) this.transloco.setActiveLang(lang);
  }

  handleLogout() {
    setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    logout().then(() => this.router.navigate(['/logout']));
  }

  handleOverride() {
    this.overrideUserDialog()?.open();
  }

  handleOverrideUser() {
    this.overrideUserDialog()?.handleOverrideUser();
  }

  handleResetUserSettings() {
    this.resetUserSettingsDialog()?.open();
  }

  openSinequa() {
    window.open('https://sinequa.com', '_blank', 'noopener');
  }
}

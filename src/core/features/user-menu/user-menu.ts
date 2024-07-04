import { Component, ElementRef, computed, inject, model, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";
import { toast } from "ngx-sonner";

import { login, logout, setGlobalConfig } from "@sinequa/atomic";
import { ApplicationService, MenuComponent, MenuItemComponent, PrincipalStore, UserSettingsStore } from "@sinequa/atomic-angular";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [FormsModule, MenuComponent, MenuItemComponent, TranslocoPipe],
  templateUrl: "./user-menu.html",
  providers: [provideTranslocoScope({ scope: "user-menu", loader })]
})
export class UserMenuComponent {
  readonly menu = viewChild(MenuComponent);

  private readonly router = inject(Router);
  private readonly appService = inject(ApplicationService);
  private readonly principalStore = inject(PrincipalStore);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly transloco = inject(TranslocoService);

  readonly user = computed(() => {
    const principal = getState(this.principalStore).principal;
    return principal;
  })

  readonly initials = computed(() => {
    const principal = this.user();
    const separator = principal.fullName ? ' ' : '.';
    return (principal.fullName || principal.name || '').split(separator).filter(word => word[0] && (word[0] === word[0].toUpperCase())).map(word => word[0]).join('').slice(0, 3);
  });

  readonly isAdmin = computed(() => this.principalStore.principal().isAdministrator || this.principalStore.principal().isDelegatedAdmin);

  readonly allowUserOverride = computed(() => {
    return this.principalStore.allowUserOverride();
  })

  readonly isOverridingUser = computed(() => {
    return this.principalStore.isOverridingUser();
  })

  readonly overrideUser = model<{ username: string; domain: string }>({ username: '', domain: '' });
  readonly overrideUserDialog = viewChild<ElementRef>('overrideUserDialog');

  changeLanguage(lang: string) {
    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
    }
    this.menu()?.close();
  }

  handleLogout() {
    logout().then(() => this.router.navigate(['/logout']));
  }

  handleOverride() {
    this.menu()?.close();
    this.overrideUserDialog()!.nativeElement.showModal();
  }

  override() {
    if (!!this.overrideUser().domain && !!this.overrideUser().username) {
      this.handleOverrideUser(this.overrideUser().username, this.overrideUser().domain);
      this.overrideUserDialog()!.nativeElement.close();
    }
  }

  handleOverrideUser(username?: string, domain?: string) {
    if (username === undefined || domain === undefined) {
      setGlobalConfig({ userOverrideActive: false, userOverride: undefined });
    }
    else {
      setGlobalConfig({ userOverrideActive: true, userOverride: { username, domain } });
    }
    login().then(value => {
      if (value) {
        this.appService.init().then(() => {
          const { fullName } = getState(this.principalStore).principal;
          toast(`Welcome back ${fullName}!`, { duration: 2000 })
        });
      }
    });
  }

  handleResetUserSettings() {
    console.log("Resetting user settings");
    this.userSettingsStore.reset().then(() => {
      toast("User settings have been reset", { duration: 2000 });
    });
    this.menu()?.close();
  }

  openAdmin() {
    window.open(`${window.location.origin}/admin`, "_blank");
  }

  openSinequa() {
    window.open("https://sinequa.com", "_blank");
  }
}
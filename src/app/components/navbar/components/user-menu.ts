import { ApplicationService } from "@/app/services";
import { PrincipalStore, UserSettingsStore } from "@/app/stores";
import { Component, computed, inject, viewChild } from "@angular/core";
import { Router } from "@angular/router";
import { getState } from "@ngrx/signals";
import { login, logout, setGlobalConfig } from "@sinequa/atomic";
import { MenuComponent, MenuItemComponent } from "@sinequa/atomic-angular";
import { toast } from "ngx-sonner";

import { AuthorAvatarComponent } from "../../author/author-avatar/author-avatar.component";
import { PersonArticle } from "@/app/types";

@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [MenuComponent, MenuItemComponent, AuthorAvatarComponent],
  templateUrl: "./user-menu.html"
})
export class UserMenuComponent {
  menu = viewChild(MenuComponent);

  private readonly router = inject(Router);

  appService = inject(ApplicationService);
  principalStore = inject(PrincipalStore);
  userSettingsStore = inject(UserSettingsStore);

  person = computed(() => ({employeeFullName: this.user().fullName}) as PersonArticle )
  user = computed(() => {
    const principal = getState(this.principalStore).principal;
    return principal;
  })

  allowUserOverride = computed(() => {
    return this.principalStore.allowUserOverride();
  })

  isOverridingUser = computed(() => {
    return this.principalStore.isOverridingUser();
  })

  /**
 * Upon dropdown menu element click
 * @param e The clicked element
 */
  onClick(e: string) {
    toast("Clicked on " + e, { duration: 2000 });
  }

  handleLogout() {
    logout().then(() => this.router.navigate(['/login']));
  }

  handleOverrideUser(username?: string, domain?: string) {
    if(username === undefined || domain === undefined) {
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
    this.menu()?.toggle(new MouseEvent('click'));
  }

}
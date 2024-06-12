import { ApplicationService } from "@/app/services";
import { PrincipalStore, UserSettingsStore } from "@/app/stores";
import { Component, ElementRef, computed, inject, model, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { getState } from "@ngrx/signals";
import { login, logout, setGlobalConfig } from "@sinequa/atomic";
import { MenuComponent, MenuItemComponent } from "@sinequa/atomic-angular";
import { toast } from "ngx-sonner";


@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [FormsModule, MenuComponent, MenuItemComponent],
  templateUrl: "./user-menu.html"
})
export class UserMenuComponent {
  menu = viewChild(MenuComponent);

  private readonly router = inject(Router);

  appService = inject(ApplicationService);
  principalStore = inject(PrincipalStore);
  userSettingsStore = inject(UserSettingsStore);

  user = computed(() => {
    const principal = getState(this.principalStore).principal;
    return principal;
  })

  initials = computed(() => {
    const principal = this.user();
    const separator = principal.fullName ? ' ' : '.';
    return (principal.fullName || principal.name || '').split(separator).filter( word => word[0] && (word[0] === word[0].toUpperCase()) ).map( word => word[0] ).join('').slice(0,3);
  });

  allowUserOverride = computed(() => {
    return this.principalStore.allowUserOverride();
  })

  isOverridingUser = computed(() => {
    return this.principalStore.isOverridingUser();
  })

  overrideUser = model<{username: string; domain: string}>({username: '', domain: ''});
  overrideUserDialog = viewChild<ElementRef>('overrideUserDialog');

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

  handleOverride() {
    this.menu()?.toggle(new MouseEvent('click'));
    this.overrideUserDialog()!.nativeElement.showModal();
  }

  override() {
    if (!!this.overrideUser().domain && !!this.overrideUser().username) {
      this.handleOverrideUser(this.overrideUser().username, this.overrideUser().domain);
      this.overrideUserDialog()!.nativeElement.close();
    }
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
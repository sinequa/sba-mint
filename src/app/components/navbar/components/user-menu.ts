import { PrincipalStore } from "@/app/stores";
import { Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { getState } from "@ngrx/signals";
import { logout } from "@sinequa/atomic";
import { MenuComponent, MenuItemComponent } from "@sinequa/atomic-angular";
import { toast } from "ngx-sonner";

@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [MenuComponent, MenuItemComponent],
  templateUrl: "./user-menu.html"
})
export class UserMenuComponent {

    private readonly router = inject(Router);

    principalStore = inject(PrincipalStore);

    user = computed(() => {
      const principal = getState(this.principalStore);
      return principal;
    });

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

}
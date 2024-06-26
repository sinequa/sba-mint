import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { Credentials, Principal, authenticated$, globalConfig, isAuthenticated, login, logout } from '@sinequa/atomic';
import { PrincipalService } from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';

/**
 * Represents the LoginComponent class, which is responsible for handling the login functionality.
 * This component is used to authenticate users and manage the user's authentication status.
 */
@Component({
  selector: 'sq-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: "./login.component.html",
  styles: [`
:host {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.btn-primary {
  background-color: black;
  color: white;
}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnDestroy {

  config = globalConfig;

  /**
   * Represents the user credentials for login.
   */
  credentials = signal<Credentials>({ username: '', password: '' })

  readonly authenticated = signal<boolean>(false);
  readonly user = signal<Principal | null>(null);
  readonly returnUrl = signal<string[] | null>(null);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly principalService = inject(PrincipalService);

  private sub = new Subscription();

  /**
   * Indicates whether the login credentials are valid.
   * Returns true if both the username and password are non-empty, otherwise false.
   */
  valid = computed(() => this.credentials().username.length > 0 && this.credentials().password.length > 0);

  constructor() {
    this.authenticated.set(isAuthenticated());

    effect(() => {
      if (this.authenticated()) {
        this.sub.add(this.principalService.getPrincipal().subscribe((principal) => this.user.set(principal)))
      }
    })

    effect(() => {
      if (this.returnUrl() !== null) {
        const [url] = this.returnUrl() || ["/"];
        this.router.navigateByUrl(url);
      }
    })

    this.sub.add(authenticated$.subscribe((response) => {
      this.authenticated.set(response);
      const url = this.route.snapshot.queryParams['returnUrl'] || null;

      if (url !== null) {
        this.returnUrl.set([url]);
      }

      if (isAuthenticated()) {
        if (url !== null) {
          this.router.navigateByUrl(url);
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /**
   * Updates the credentials with the provided values.
   * @param credentials - An object containing the username and password.
   */
  updateCredentials(credentials: { username?: string, password?: string }) {
    this.credentials.update(v => ({ ...v, ...credentials }));
  }

  async handleLogout() {
    await logout();
    this.authenticated.set(false);
  }

  /**
   * Handles the login process without credentials.
   * This method calls the login function asynchronously.
   */
  async handleLogin() {
    await login();

  }

  /**
   * Handles the login process with credentials.
   * Calls the login function with the provided credentials and handles any errors that occur.
   */
  async handleLoginWithCredentials() {
    login(this.credentials())
      .catch(e => {
        if (e instanceof Error) {
          toast.error(e.message);
        }
        if (e instanceof Response) {
          toast.error(e.statusText);
        }
      });
  }
}

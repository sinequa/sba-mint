import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { Credentials, Principal, authenticated$, globalConfig, isAuthenticated, login, logout } from '@sinequa/atomic';
import { ApplicationService, ApplicationStore, PrincipalService, PrincipalStore } from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';
import { SearchComponent } from '@/app/pages/search/search.component';
import { SearchAllComponent } from '@/app/pages/search/all/search-all.component';
import { getState } from '@ngrx/signals';

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
  protected readonly appService = inject(ApplicationService);
  protected readonly applicationStore = inject(ApplicationStore);
  protected readonly principalStore = inject(PrincipalStore);



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
        } else {
          this.router.navigateByUrl("/");
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
    if (!this.valid()) return;

    login(this.credentials()).then(value => {
      if (value) {
        this.appService.initWithCreateRoutes(SearchComponent, SearchAllComponent).then(() => {
          const { fullName, name } = getState(this.principalStore).principal;

          toast(`Welcome back ${fullName || name}!`, { duration: 2000 })
          this.applicationStore.updateReadyState();

          this.router.navigateByUrl(this.route.snapshot.queryParams['returnUrl'] || '/');

        }).catch((error: Error) => {
          toast.error("An error occured while initializing the application", { description: error.message, duration: 3000 });
        });
      }
    }).catch(e => {
      if (e instanceof Error) {
        console.error(e.message);
      }
      if (e instanceof Response) {
        console.error(e.statusText);
      }
    });
  }
}

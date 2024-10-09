import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

import { Credentials, Principal, authenticated$, globalConfig, isAuthenticated, login, logout } from '@sinequa/atomic';
import { ApplicationService, PrincipalService } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

/**
 * Represents the LoginComponent class, which is responsible for handling the login functionality.
 * This component is used to authenticate users and manage the user's authentication status.
 */
@Component({
  selector: 'sq-login',
  standalone: true,
  imports: [RouterModule, FormsModule, TranslocoPipe],
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
  providers: [provideTranslocoScope({ scope: "login", loader })]
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
  private readonly translocoService = inject(TranslocoService);



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
    login().catch((error) => {
      {
        console.warn("An error occurred while logging in", error);
        this.router.navigate(['error'])
      }
    });
  }

  /**
   * Handles the login process with credentials.
   * Calls the login function with the provided credentials and handles any errors that occur.
   */
  async handleLoginWithCredentials() {
    if (!this.valid()) return;

    this.appService.logMeIn(this.credentials()).then((value) => {
      this.router.navigateByUrl(this.route.snapshot.queryParams['returnUrl'] || '/');
    }).catch((e) => {
      if (e instanceof Error) {
        console.error(e.message);
      }
      if (e instanceof Response) {
        console.error(e.statusText);
      }
      if (e.status === 401 && e instanceof Response === false) {
        const message = this.translocoService.translate('login.invalidCredentials');
        toast.error(message, { duration: 2000 });
      }
    });
  }
}

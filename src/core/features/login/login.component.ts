import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { Principal, authenticated$, globalConfig, isAuthenticated, login, logout } from '@sinequa/atomic';
import { PrincipalService } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

/**
 * Represents the LoginComponent class, which is responsible for handling the login functionality.
 * This component is used to authenticate users and manage the user's authentication status.
 */
@Component({
  selector: 'sq-login',
  standalone: true,
  imports: [RouterModule, TranslocoPipe],
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
  providers: [provideTranslocoScope({ scope: 'login', loader })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  config = globalConfig;
  readonly authenticated = signal<boolean | null>(null);
  readonly user = signal<Principal | null>(null);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly principalService = inject(PrincipalService);

  private sub = new Subscription();

  returnUrl = signal<string[] | null>(null);

  constructor() {
    this.authenticated.set(isAuthenticated());

    effect(() => {
      if (this.authenticated()) {
        this.principalService.getPrincipal().subscribe((principal) => this.user.set(principal))
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

  async handleLogout() {
    await logout();
    this.authenticated.set(false);
  }

  async handleLogin() {
    await login();
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { NgxSonnerToaster } from 'ngx-sonner';

import { CCApp, getHelpIndexUrl, globalConfig, isAuthenticated } from '@sinequa/atomic';
import {
  ApplicationService,
  ApplicationStore,
  AppStore,
  BackdropComponent,
  DrawerStackComponent,
  PrincipalStore,
  UserSettingsStore
} from '@sinequa/atomic-angular';

import { AppSidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster, BackdropComponent, DrawerStackComponent, AppSidebarComponent],
  templateUrl: './app.component.html',
  styles: [
    `
      #navbar-logo {
        content: var(--logo-small) / var(--logo-small-alt-text);
      }
    `
  ]
})
export class AppComponent {
  private readonly applicationService = inject(ApplicationService);
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly transloco = inject(TranslocoService);

  private readonly router = inject(Router);
  private readonly title = inject(Title);

  private readonly applicationStore = inject(ApplicationStore);
  private readonly principalStore = inject(PrincipalStore);

  protected readonly allowAI = computed(() => this.appStore.customizationJson()?.['assistants']?.[this.instanceId()]?.['defaultValues']?.['service_id']);
  readonly instanceId = computed(() => {
    const { name } = getState(this.appStore) as CCApp;
    return `${name}-standalone-assistant`;
  });

  protected readonly authenticated = computed(() => isAuthenticated());
  readonly isAdmin = computed(() => this.principalStore.principal().isAdministrator || this.principalStore.principal().isDelegatedAdmin);

  constructor(private destroyRef: DestroyRef) {
    const controller = new AbortController();
    addEventListener(
      'authenticated',
      (event: Event) => {
        const customEvent = event as CustomEvent;

        const { authenticated } = customEvent.detail;
        if (authenticated) {
          console.log('User authenticated (from event), initializing application...');
          this.initApplication();
        }
      },
      { signal: controller.signal }
    );

    destroyRef.onDestroy(() => {
      controller.abort();
    });

    const { useSSO } = globalConfig;
    if (useSSO) {
      this.initApplication();
    } else {
      if (isAuthenticated()) {
        this.initApplication();

        if (this.router.url === '/error') {
          this.router.navigate(['/']);
        }
      }
    }

    effect(() => {
      const general = this.appStore.general();

      if (general) {
        if (general.name) {
          this.title.setTitle(general!.name);
        }
        if (general.logo?.light?.small) {
          document.documentElement.style.setProperty(`--logo-small`, `url(${general.logo?.light?.small})`);
        }
        if (general.logo?.light?.large) {
          document.documentElement.style.setProperty(`--logo-large`, `url(${general.logo?.light?.large})`);
        }
      }
    });
  }

  initApplication() {
    this.applicationService
      .initAndCreateRoutes()
      .then(() => {
        this.setupApplicationLanguage();
        this.applicationStore.updateReadyState(true);
      })
      .catch(err => {
        console.error('Error initializing application', err);
        this.applicationStore.updateReadyState(false);
      });
  }

  private setupApplicationLanguage() {
    if (this.userSettingsStore.language?.() === undefined) this.userSettingsStore.updateLanguage('en');

    this.transloco.setActiveLang(this.userSettingsStore.language?.() ?? 'en');
  }

  openHelp() {
    const url = getHelpIndexUrl(this.transloco.getActiveLang(), {
      folder: 'mint-search',
      path: '/r/_sinequa/webpackages/help',
      indexFile: 'olh-index.html',
      useLocale: true,
      useLocaleAsPrefix: true
    });
    window.open(url, '_blank', 'noopener');
  }

  openAdmin() {
    window.open(`${window.location.origin}/admin`, '_blank', 'noopener');
  }
}

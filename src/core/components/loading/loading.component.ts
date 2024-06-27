import { SearchAllComponent } from "@/app/pages/search/all/search-all.component";
import { SearchComponent } from "@/app/pages/search/search.component";
import { Component, computed, effect, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { getState } from "@ngrx/signals";
import { CCApp, globalConfig, login } from "@sinequa/atomic";

import { AppStore, ApplicationService, ApplicationStore, AuthGuard, InitializationGuard, PrincipalStore, QueryParamsStore } from "@sinequa/atomic-angular";
import { toast } from "ngx-sonner";

@Component({
  selector: "app-wait",
  standalone: true,
  template: `
<div class="flex h-[100dvh] w-full items-center justify-center">
  <div class="flex flex-col items-center space-y-4">
     <span class="loader"></span>
    <p class="text-lg font-medium text-neutral-500 dark:text-neutral-400">Loading...</p>
  </div>
</div>
`,
  styles: [`
.loader {
  --w: 96px;
  --h: 96px;

  transform: rotateZ(45deg);
  perspective: 1000px;
  border-radius: 50%;
  width: var(--w);
  height: var(--h);
  color: #0040bf; /* Sinequa blue */
}
.loader:before,
.loader:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
    border-radius: 50%;
    transform: rotateX(70deg);
    animation: 1s spin linear infinite;
  }
  .loader:after {
    color: #FF854a; /* Sinequa orange */
    transform: rotateY(70deg);
    animation-delay: .4s;
  }

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotateZ(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotateZ(360deg);
  }
}

@keyframes rotateccw {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}

@keyframes spin {
  0%,
  100% {
    box-shadow: .4em 0px 0 0px currentcolor;
  }
  12% {
    box-shadow: .4em .4em 0 0 currentcolor;
  }
  25% {
    box-shadow: 0 .4em 0 0px currentcolor;
  }
  37% {
    box-shadow: -.4em .4em 0 0 currentcolor;
  }
  50% {
    box-shadow: -.4em 0 0 0 currentcolor;
  }
  62% {
    box-shadow: -.4em -.4em 0 0 currentcolor;
  }
  75% {
    box-shadow: 0px -.4em 0 0 currentcolor;
  }
  87% {
    box-shadow: .4em -.4em 0 0 currentcolor;
  }
}
`]
})
export class LoadingComponent {
  appService = inject(ApplicationService);
  principalStore = inject(PrincipalStore);
  appStore = inject(AppStore);
  applicationStore = inject(ApplicationStore);


  application = inject(ApplicationStore);
  queryParamsStore = inject(QueryParamsStore);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  state = computed(() => getState(this.application))

  constructor() {
    effect(() => {

      const { ready } = this.state();

      if (ready) {
        setTimeout(() => {
          const url = this.route.snapshot.queryParams['returnUrl'] || null;
          this.router.navigateByUrl(url);

          // ! we need to set the query params from the url once only
          this.queryParamsStore.setFromUrl(url);

        }, 700);
      }
    })

    const { useCredentials } = globalConfig;

    login().then(value => {
      if (value) {
        this.appService.init().then(() => {
          const { fullName, name } = getState(this.principalStore).principal;

          this.createRoutes();

          toast(`Welcome back ${fullName || name}!`, { duration: 2000 })
          this.applicationStore.updateReadyState();

        });
      }
    })
    .catch(error => {
    //   toast.error("An error occured while logging in", { description: error, duration: 2000 });
    // toast.error("An error occured while logging in", { description: error, duration: 2000 });
    console.error("An error occured while logging in", error)
    if(useCredentials) {
        const url = this.route.snapshot.queryParams['returnUrl'] || null;
        this.router.navigate(['/login'], { queryParams: { returnUrl: url } })
      }
    });
  }


  private createRoutes() {
    // Now we can create the dynamic routes based on the Queries's tabs
    const { queries } = getState(this.appStore) as CCApp;
    const array = Object.entries(queries).map(([key, value]) => ({ key, ...value }));

    // We need to create a route for each tab in each query
    // if a query has no tabs, we create a route with the query name as the tab name
    const tabs = array.map(item => ({ tabs: item.tabSearch.tabs || [{name: item.name}], queryName: item.name }));

    // We need to remove the current search route from the router config
    // the route exists in the router config because it was created in the app-routing.module.ts and we need it
    // to be able to navigate to the search page. We will recreate it with the new tabs
    const currentConfig = this.router.config.filter(route => route.path !== 'search');

    // create the children routes for the search route
    const children = tabs.map(item => item.tabs.map(tab => ({ path: tab.name, component: SearchAllComponent, data: { queryName: item.queryName, display: tab.name } }))).flat();
    const searchPath = this.router.config.find(route => route.path === 'search')
      || { path: 'search', component: SearchComponent, canActivate: [AuthGuard(), InitializationGuard()], children: [] };

    searchPath.component = SearchComponent;
    searchPath.children = [...children, { path: '**', redirectTo: 'all', pathMatch: 'full' }];

    const newConfig = [searchPath, ...currentConfig];
    // finally we reset the router config with the new routes
    this.router.resetConfig(newConfig);
  }
}
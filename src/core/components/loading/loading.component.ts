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
  protected readonly appService = inject(ApplicationService);
  protected readonly principalStore = inject(PrincipalStore);
  protected readonly appStore = inject(AppStore);
  protected readonly applicationStore = inject(ApplicationStore);
  protected readonly queryParamsStore = inject(QueryParamsStore);

  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  state = computed(() => getState(this.applicationStore))

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
        this.appService.initWithCreateRoutes(SearchComponent, SearchAllComponent).then(() => {
          const { fullName, name } = getState(this.principalStore).principal;

          toast(`Welcome back ${fullName || name}!`, { duration: 2000 })
          this.applicationStore.updateReadyState();

        }).catch((error:Error) => {
          toast.error("An error occured while initializing the application", { description: error.message, duration: 3000 });
        });
      }
    })
    .catch(error => {
      console.error("An error occured while logging in", error)
      if(useCredentials) {
          const url = this.route.snapshot.queryParams['returnUrl'] || null;
          this.router.navigate(['/login'], { queryParams: { returnUrl: url } })
      }
    });
  }
}
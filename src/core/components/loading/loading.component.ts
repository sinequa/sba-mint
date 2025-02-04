import { Component, computed, effect, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { getState } from "@ngrx/signals";

import { ApplicationStore, QueryParamsStore } from "@sinequa/atomic-angular";

@Component({
  selector: "app-wait",
  standalone: true,
  imports: [],
  template: `
    <div class="flex h-[100dvh] w-full items-center justify-center">
      <div class="flex flex-col items-center space-y-4">
        <span class="loader"></span>
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
  protected readonly state = computed(() => getState(this.application))

  private readonly application = inject(ApplicationStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
  }
}

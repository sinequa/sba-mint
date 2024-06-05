import { Component, computed, effect, inject } from "@angular/core";
import { getState } from "@ngrx/signals";
import { CCApp } from "@sinequa/atomic";
import { AppStore, ApplicationStore } from "../stores";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-wait",
  standalone: true,
  template: `
<div class="flex h-[100dvh] w-full items-center justify-center">
  <div class="flex flex-col items-center space-y-4">
    <div class="lds-facebook"><div></div><div></div><div></div></div>
    <p class="text-lg font-medium text-gray-500 dark:text-gray-400">Loading...</p>
  </div>
</div>
`,
styles: [`

.lds-facebook,
.lds-facebook div {
  box-sizing: border-box;
}
.lds-facebook {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-facebook div {
  display: inline-block;
  position: absolute;
  left: 8px;
  width: 16px;
  background: currentColor;
  animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
.lds-facebook div:nth-child(1) {
  left: 8px;
  animation-delay: -0.24s;
}
.lds-facebook div:nth-child(2) {
  left: 32px;
  animation-delay: -0.12s;
}
.lds-facebook div:nth-child(3) {
  left: 56px;
  animation-delay: 0s;
}
@keyframes lds-facebook {
  0% {
    top: 8px;
    height: 64px;
  }
  50%, 100% {
    top: 24px;
    height: 32px;
  }
}

`]
})
export class LoadingComponent {
  application = inject(ApplicationStore);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  state = computed(() => getState(this.application))

  constructor() {
    effect(() => {

      const { ready  } = this.state();

      if(ready) {
        setTimeout(() => {
          const url = this.route.snapshot.queryParams['returnUrl'] || null;
          this.router.navigateByUrl(url);
        }, 700);
      }
    })
  }
}
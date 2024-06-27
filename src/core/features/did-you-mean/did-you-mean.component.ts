import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import { Result } from '@sinequa/atomic';
import { QueryParamsStore } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-did-you-mean',
  standalone: true,
  imports: [RouterModule, TranslocoPipe],
  templateUrl: './did-you-mean.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
  providers: [provideTranslocoScope({ scope: 'did-you-mean', loader })]
})
export class DidYouMeanComponent {
  result = input<Result>();

  protected spellingCorrectionMode = computed(() => this.result()?.didYouMean?.spellingCorrectionMode);
  protected correction = computed(() => this.result()?.didYouMean?.text.corrected);
  protected original = computed(() => this.result()?.didYouMean?.text.original);

  readonly router = inject(Router);
  private readonly queryParamsStore = inject(QueryParamsStore);

  selectCorrected(): void {
    this.queryParamsStore.patch({ spellingCorrectionMode: "dymonly", text: this.correction()! });
    this.router.navigate([], { queryParamsHandling: 'merge', queryParams: { c: "dymonly", q: this.correction() } })
  }

  selectOriginal(): void {
    this.queryParamsStore.patch({ spellingCorrectionMode: "dymonly" });
    this.router.navigate([], { queryParamsHandling: 'merge', queryParams: { c: "dymonly", q: this.original() } })
  }
}

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Result } from '@sinequa/atomic';
import { Subscription } from 'rxjs';
import { SearchService } from '../services';
import { queryParamsStore, searchInputStore } from '../stores';

@Component({
  selector: 'app-did-you-mean',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './did-you-mean.component.html'
})
export class DidYouMeanComponent implements OnInit, OnDestroy {
  protected spellingCorrectionMode?: string;
  protected correction?: string;
  protected original?: string;

  readonly router = inject(Router);



  private readonly subscription = new Subscription();
  private readonly searchService = inject(SearchService);


  ngOnInit(): void {
    this.subscription.add(
      this.searchService.result$
        .subscribe((result: Result) => {
          this.spellingCorrectionMode = result.didYouMean?.spellingCorrectionMode;
          this.correction = result.didYouMean?.text.corrected;
          this.original = result.didYouMean?.text.original;
        })
    );
  }

  selectCorrected(): void {
    queryParamsStore.patch({spellingCorrectionMode: "dymonly"});
    searchInputStore.set(this.correction!);
    this.router.navigate([], { queryParamsHandling: 'merge', queryParams: {c: "dymonly", q: this.correction! } })
  }

  selectOriginal(): void {
    queryParamsStore.patch({spellingCorrectionMode: "dymonly"});
    this.router.navigate([], { queryParamsHandling: 'merge', queryParams: {c: "dymonly", q: this.original! } })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

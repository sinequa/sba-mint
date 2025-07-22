import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslocoDateImpurePipe } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-recent-searches',
  imports: [RouterModule],
  template: ` <div class="layout-search overflow-auto">TO BE MERGED</div> `,
  host: {
    class: 'flex flex-col h-full w-full'
  },
  providers: [TranslocoDateImpurePipe]
})
export class RecentSearchesComponent {}

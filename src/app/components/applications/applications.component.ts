import { AppStore } from '@/app/stores';
import { CJApplication } from '@/app/types';
import { Component, computed, inject } from '@angular/core';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [],
  templateUrl: './applications.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: "block"
  }
})
export class ApplicationsComponent {

  appStore = inject(AppStore);

  readonly applications = computed(() => this.appStore.customizationJson()?.applications) ?? [];

  public applicationClicked(application: CJApplication): void {
    if (application.url) {
      toast('Opening ' + application.name + '...', { duration: 2000 });
      window.open(application.url, '_blank');
    } else {
      toast.warning('No url defined for  ' + application.name, { duration: 2000 });

    }
  }
}

import { bootstrapApplication } from '@angular/platform-browser';
import { setGlobalConfig } from '@sinequa/atomic';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

setGlobalConfig(environment);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

import { InjectionToken } from '@angular/core';

export const APP_FEATURES = new InjectionToken<{ assistant: { usePrefixName: boolean } }>('app.features');

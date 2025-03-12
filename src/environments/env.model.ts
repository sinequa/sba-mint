import { AppGlobalConfig } from '@sinequa/atomic';

export type Environment = Partial<AppGlobalConfig> & {
  production: boolean;
};

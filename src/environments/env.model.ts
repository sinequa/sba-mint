import { AppGlobalConfig } from "@sinequa/atomic";

export type Environment = AppGlobalConfig & {
  production: boolean;
}
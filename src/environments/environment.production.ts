import { Environment } from "./env.model";

export const environment: Environment = {
  production: true,
  app: 'mint-preview',
  backendUrl: window.location.origin
};
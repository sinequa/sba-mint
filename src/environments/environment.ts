import { Environment } from "./env.model";

export const environment: Environment = {
  production: false,
  app: 'workplace-search',
  backendUrl: window.location.origin,
  autoOAuthProvider: 'azure_mfa_dev'
};
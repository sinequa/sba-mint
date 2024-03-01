import { Environment } from "./env.model";

export const environment: Environment = {
  production: false,
  app: 'workplace-search-mint',
  backendUrl: window.location.origin,
  autoOAuthProvider: 'azure_mfa_dev'
};
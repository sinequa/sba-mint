// @ts-check
// GitHub Enterprise site: https://github.sinequa.com/pages/Product/sba-mint/
// Everything but the three keys below lives in docusaurus.config.base.js.
import { createConfig } from './docusaurus.config.base.js';

export default createConfig({
  url: 'https://github.sinequa.com/',
  baseUrl: '/pages/Product/sba-mint/',
  deploymentBranch: 'gh-pages'
});

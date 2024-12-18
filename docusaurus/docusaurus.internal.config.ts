import {themes as prismThemes, Prism} from 'prism-react-renderer';
(typeof global !== "undefined" ? global : window).Prism = Prism
require("prismjs/components/prism-csharp");
require("prismjs/components/prism-bash");

import { Config } from "@docusaurus/types";


const config: Config = {
  title: 'Sinequa Mint',
  tagline: 'Connect your modern workplace and drive innovation from the inside out',
  favicon: 'img/favicon.ico',
  staticDirectories: ['static'],

  // Set the production url of your site here
  url: 'https://github.sinequa.com/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/pages/Product/sba-mint/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sinequa', // Usually your GitHub org/user name.
  projectName: 'sba-mint', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  trailingSlash: false,

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [require.resolve('docusaurus-lunr-search')],

  markdown: {
    mdx1Compat: {
      comments: false,
      admonitions: false,
      headingIds: false
    }
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/sinequa/sba-angular/tree/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Mint',
        logo: {
          alt: 'Sinequa Logo',
          src: 'img/sinequa-logo-light-sm.png',
        },
        items: [
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'atomic',
            label: 'Atomic',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'atomicAngular',
            label: 'Atomic for Angular',
          },
          {
            href: 'https://github.com/sinequa/sba-mint',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: 'https://x.com/sinequa',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Website',
                href: 'https://sinequa.com',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/sinequa/sba-mint',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} <a href="https://www.sinequa.com" aria-alt="Sinequa website">Sinequa</a>. Distributed under the terms of the <a href="https://github.com/sinequa/sba-angular/blob/master/license.txt" aria-alt="MIT license">MIT license</a>`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        defaultLanguage: 'typescript',
        magicComments: [
          {
            className: 'code-block-error-line',
            line: 'error',
            block: {start: 'code-block-error-start', end: 'code-block-error-end'}
          },
          {
            className: 'code-block-add-line',
            line: 'add',
            block: {start: 'code-block-add-start', end: 'code-block-add-end'}
          },
          {
            className: 'code-block-remove-line',
            line: 'remove',
          }
        ]
      },
    }),
};

export default config;

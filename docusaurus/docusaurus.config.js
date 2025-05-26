// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sinequa',
  tagline: 'Connect your modern workplace and drive innovation from the inside out',
  favicon: 'img/favicon.ico',
  staticDirectories: ['static'],

  // Set the production url of your site here
  url: 'https://github.com/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/sba-mint/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sinequa', // Usually your GitHub org/user name.
  projectName: 'sba-mint', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  trailingSlash: false,
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  plugins: [require.resolve('docusaurus-lunr-search')],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          // path: 'docs',
          sidebarPath: './sidebars.js'
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css'
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true
        }
      },
      navbar: {
        title: 'Mint',
        logo: {
          alt: 'Sinequa Logo',
          src: 'img/sinequa-logo-light-sm.png'
        },
        items: [
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'docs',
          //   position: 'left',
          //   label: 'Docs',
          // },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'atomic',
            label: 'Atomic'
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'atomicAngular',
            label: 'Atomic for Angular'
          },
          {
            href: 'https://github.com/sinequa/sba-mint',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: 'https://x.com/sinequa'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'Website',
                href: 'https://sinequa.com'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/sinequa/sba-mint'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} <a href="https://www.sinequa.com" aria-alt="Sinequa website">Sinequa</a>. Distributed under the terms of the <a href="https://github.com/sinequa/sba-angular/blob/master/license.txt" aria-alt="MIT license">MIT license</a>`
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        defaultLanguage: 'typescript',
        magicComments: [
          {
            className: 'code-block-error-line',
            line: 'error',
            block: { start: 'code-block-error-start', end: 'code-block-error-end' }
          },
          {
            className: 'code-block-add-line',
            line: 'add',
            block: { start: 'code-block-add-start', end: 'code-block-add-end' }
          },
          {
            className: 'code-block-remove-line',
            line: 'remove'
          }
        ]
      }
    }),
  themes: ['@docusaurus/theme-mermaid'],
  // In order for Mermaid code blocks in Markdown to work,
  // you also need to enable the Remark plugin with this option
  markdown: {
    mermaid: true
  }
};

export default config;

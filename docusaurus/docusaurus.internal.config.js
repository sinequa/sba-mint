import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sinequa',
  tagline: 'Connect your modern workplace and drive innovation from the inside out',
  favicon: 'img/favicon.png',
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

  trailingSlash: false,

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  plugins: [require.resolve('docusaurus-lunr-search')],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          routeBasePath: '/',
          includeCurrentVersion: false,
          // path: 'docs',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/sinequa/sba-angular/tree/main/',
          sidebarPath: './sidebars.js',
          sidebarItemsGenerator: async function ({ defaultSidebarItemsGenerator, ...args }) {
            // Use the default sidebar items generator to generate the sidebar items
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            // Customize the folder names here
            return sidebarItems.map(item => {
              // Capitalize the first letter of the label for category items
              if (item.type === 'category') {
                return {
                  ...item,
                  label: item.label.charAt(0).toUpperCase() + item.label.slice(1)
                };
              }
              return item;
            });
          }
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css'
        }
      }
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
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
          src: 'img/Logo_SINEQUA_RVB-170.png'
        },
        items: [
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
            type: 'docsVersionDropdown',
            position: 'right'
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
            block: { start: 'error-start', end: 'error-end' }
          },
          {
            className: 'code-block-add-line',
            line: 'add',
            block: { start: 'add-start', end: 'add-end' }
          },
          {
            className: 'code-block-remove-line',
            line: 'remove',
            block: { start: 'remove-start', end: 'remove-end' }
          }
        ]
      }
    },
  themes: ['@docusaurus/theme-mermaid'],
  // In order for Mermaid code blocks in Markdown to work,
  // you also need to enable the Remark plugin with this option
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn'
    }
  }
};

export default config;

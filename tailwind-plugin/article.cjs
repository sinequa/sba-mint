const plugin = require('tailwindcss/plugin')
const { borderWidth } = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

const article = plugin(function ({ addBase, addComponents, theme }) {
  addBase({
    ['ul:has(.article.selected) .article:not(.selected)']: {
      opacity: '0.5',
    }
  }),
  addComponents({
    '.article': {
      display: 'flex',
      gap: theme('spacing.2'),
      padding: theme('spacing.4'),
      borderRadius: theme('borderRadius.lg'),
      borderWidth: borderWidth.DEFAULT,
      borderColor: theme('colors.neutral.300'),
      color: theme('colors.neutral.600'),
      cursor: 'pointer',
      '&:disabled': {
        opacity: '0.5',
        pointerEvents: 'none'
      },
      '&.selected': {
        backgroundColor: theme('colors.secondary'),
        borderColor: theme('colors.primary')
      },
      '&:hover:not(.selected)': {
        boxShadow: theme('boxShadow.article')
      }
    },
  })
})

export default article;
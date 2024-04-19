const plugin = require('tailwindcss/plugin')
const { borderWidth } = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

const button = plugin(function ({ addComponents, theme }) {
  addComponents({
    '.btn': {
      padding: theme('spacing.2'),
      borderRadius: theme('borderRadius.md'),
      backgroundColor: theme('colors.zinc.900'),
      color: theme('colors.zinc.50'),
      cursor: 'pointer',
      '&:hover': {
        opacity: '0.9'
      },
      '&:disabled': {
        opacity: '0.5',
        pointerEvents: 'none'
      }
    },
    '.btn-primary': {
      backgroundColor: theme('colors.primary'),
      color: theme('colors.white')
    },
    '.btn-secondary': {
      backgroundColor: theme('colors.secondary'),
      color: theme('colors.primary')
    },
    '.btn-outline': {
      borderWidth: theme('borderWidth.DEFAULT'),
      borderColor: theme('colors.primary'),
      backgroundColor: theme('colors.white'),
      color: theme('colors.primary'),
      '&:hover': {
        backgroundColor: theme('colors.primary'),
        color: theme('colors.white')
      }
    },
    '.btn-xs': {
      padding: theme('spacing.1'),
      fontSize: theme('fontSize.xs'),
      lineHeight: theme('lineHeight.4')
    },
    '.btn-sm': {
      padding: theme('spacing.2'),
      fontSize: theme('fontSize.sm'),
      lineHeight: theme('lineHeight.5')
    },
    '.btn-lg': {
      padding: theme('spacing.3'),
      fontSize: theme('fontSize.lg'),
      lineHeight: theme('lineHeight.7')
    },
    '.btn-xl': {
      padding: theme('spacing.4'),
      fontSize: theme('fontSize.xl'),
      lineHeight: theme('lineHeight.7')
    }
  })
})

export default button;
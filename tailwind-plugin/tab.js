const plugin = require('tailwindcss/plugin')
const { borderWidth, fontWeight } = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

const tab = plugin(function ({ addComponents, theme }) {
  addComponents({
    '.tabs': {

    },
    '.tab': {
      padding: theme('spacing.2') + ' ' + theme('spacing.3'),
      userSelect: 'none',
      fontWeight: fontWeight.semibold,
      borderBottomWidth: borderWidth.DEFAULT,
      borderColor: theme('colors.neutral.300'),
      color: theme('colors.neutral.600'),
      cursor: 'pointer',
      [['&:hover','&:focus']]: {
        color: theme('colors.primary'),
        borderColor: theme('colors.primary'),
        opacity: '0.9'
      },
      '&:focus': {
        outline: 'none'
      },
      '&:disabled': {
        color: theme('colors.neutral.300'),
        pointerEvents: 'none'
      }
    }
  })
})

export default tab;
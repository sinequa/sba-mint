const plugin = require('tailwindcss/plugin')
const { borderWidth } = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

const avatar = plugin(function ({ addBase, addComponents, theme }) {
  addComponents({
    '.avatar': {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: theme('spacing.10'),
      height: theme('spacing.10'),
      flexShrink: 0,
      overflow: 'hidden',
      borderRadius: theme('borderRadius.full'),
      backgroundColor: theme('colors.primary'),
      fontWeight: theme('fontWeight.medium'),
      color: theme('colors.secondary')
    }
  })
})

export default avatar;
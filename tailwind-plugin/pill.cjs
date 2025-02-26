const plugin = require('tailwindcss/plugin')
const { borderWidth } = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

const avatar = plugin(function ({ addBase, addComponents, theme }) {
  addComponents({
    '.badge': {
      display: 'flex',
      flexWrap: 'wrap',
      backgroundClip: 'text',
      gap: theme('spacing.2'),
      '> span': {
        paddingLeft: theme('spacing.2'),
        paddingRight: theme('spacing.2'),
        display: 'inline-block',
        borderWidth: '1px',
        borderRadius: theme('borderRadius.full'),
        borderColor: 'inherit',
        backgroundColor: 'inherit',
      },
      '&-ghost > span': {
        borderWidth: '0',
      },
      '&-xs > span': {
        fontSize: theme('fontSize.xs'),
        lineHeight: theme('spacing.5')
      },
      '&-sm > span': {
        fontSize: theme('fontSize.sm'),
        lineHeight: theme('spacing.6'),
      },
      '&-lg > span': {
        paddingLeft: theme('spacing.4'),
        paddingRight: theme('spacing.4'),
        fontSize: theme('fontSize.lg'),
        lineHeight: theme('spacing.8')
      },
      '&-xl > span': {
        paddingLeft: theme('spacing.5'),
        paddingRight: theme('spacing.5'),
        fontSize: theme('fontSize.xl'),
        lineHeight: theme('spacing.9')
      }
    },
    '.pill': {
      paddingLeft: theme('spacing.2'),
      paddingRight: theme('spacing.2'),
      display: 'inline-block',
      borderWidth: '1px',
      borderRadius: theme('borderRadius.full'),
      borderColor: theme('colors.inherit'),
      '&-ghost': {
        borderWidth: '0',
      },
      '&-xs': {
        fontSize: theme('fontSize.xs'),
        lineHeight: theme('spacing.5')
      },
      '&-sm': {
        fontSize: theme('fontSize.sm'),
        lineHeight: theme('spacing.6'),
      },
      '&-lg': {
        paddingLeft: theme('spacing.4'),
        paddingRight: theme('spacing.4'),
        fontSize: theme('fontSize.lg'),
        lineHeight: theme('spacing.8')
      },
      '&-xl': {
        paddingLeft: theme('spacing.5'),
        paddingRight: theme('spacing.5'),
        fontSize: theme('fontSize.xl'),
        lineHeight: theme('spacing.9')
      }
    }
  })
})

export default avatar;
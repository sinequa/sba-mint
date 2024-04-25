const plugin = require('tailwindcss/plugin')
const { borderWidth } = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

function toRgba(variableName) {
  return ({ opacityValue }) => {
    return `color-mix(in srgb, ${variableName} calc(${opacityValue} * 100%), transparent)`
  }
}

const button = plugin(function ({ addBase, addComponents, theme }) {
  addBase({
    [['button','.btn']]: {
      '&:hover': {
        opacity: '0.9'
      },
      '&:disabled': {
        opacity: '0.5',
        pointerEvents: 'none'
      }
    }
  });
  addComponents({
    '.btn': {
      padding: theme('spacing.2'),
      borderRadius: theme('borderRadius.DEFAULT'),
      backgroundColor: theme('colors.zinc.900'),
      color: theme('colors.zinc.50'),
      cursor: 'pointer'
    },
    '.btn-primary': {
      backgroundColor: theme('colors.primary'),
      color: theme('colors.white')
    },
    '.btn-secondary': {
      backgroundColor: theme('colors.secondary'),
      color: theme('colors.primary')
    },
    '.btn-tertiary': {
      backgroundColor: toRgba(colors.neutral[300])({ opacityValue: 0.2 }),
      color: theme('colors.neutral.600'),
    },
    '.btn-ghost': {
      backgroundColor: colors.transparent,
      color: theme('colors.neutral.600'),
      '&:hover': {
        backgroundColor: toRgba(colors.neutral[300])({ opacityValue: 0.2 })
      }
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
      lineHeight: theme('fontSize.xs.1.lineHeight')
    },
    '.btn-sm': {
      padding: theme('spacing.2'),
      fontSize: theme('fontSize.sm'),
      lineHeight: theme('fontSize.sm.1.lineHeight')
    },
    '.btn-lg': {
      padding: theme('spacing.3'),
      fontSize: theme('fontSize.lg'),
      lineHeight: theme('fontSize.lg.1.lineHeight')
    },
    '.btn-xl': {
      padding: theme('spacing.4'),
      fontSize: theme('fontSize.xl'),
      lineHeight: theme('fontSize.xl.1.lineHeight')
    }
  })
})

export default button;
const plugin = require('tailwindcss/plugin');

const dropdown = plugin(function ({ addComponents, theme }) {
  addComponents({
    '.dropdown-end .dropdown-content': {
      end: theme('end.0')
    },
    ['.dropdown:focus-within > *:not(.dropdown-content, .btn-primary)']: {
      color: theme('colors.primary'),
      backgroundColor: theme('colors.secondary'),
      borderColor: theme('colors.primary'),
    },
    '.dropdown-content': {
      zIndex: theme('zIndex.10'),
      boxShadow: theme('boxShadow.dropdown'),
      padding: theme('spacing.2'),
      marginTop: theme('spacing.1'),
      borderRadius: theme('borderRadius.lg'),
      borderWidth: theme('borderWidth.DEFAULT'),
      borderColor: theme('colors.neutral.300'),
      backgroundColor: theme('colors.white'),
      'min-width': '200px',
    },
    '.dropdown-header': {
      fontWeight: theme('fontWeight.semibold'),
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingBottom: theme('spacing.2')
    }
  })
})

export default dropdown;
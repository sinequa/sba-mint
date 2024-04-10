const plugin = require('tailwindcss/plugin');

const dropdown = plugin(function ({ addComponents, theme }) {
  addComponents({
    '.dropdown-end .dropdown-content': {
      end: theme('end.0')
    },
    ['.dropdown:focus-within > *:not(.dropdown-content, .btn-primary)']: {
      color: theme('colors.blue.500'),
      backgroundColor: theme('colors.blue.50'),
      borderColor: theme('colors.blue.600'),
    },
    '.dropdown-content': {
      zIndex: theme('zIndex.10'),
      boxShadow: theme('boxShadow.dropdown'),
      padding: theme('spacing.2'),
      marginTop: theme('spacing.1'),
      borderRadius: theme('borderRadius.md'),
      borderWidth: theme('borderWidth.1'),
      borderColor: theme('colors.gray.300'),
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
export const DESIGN = {
  colors: {
    primary: {
      50: '#f8fafc', // Very light background
      100: '#f1f5f9', // Light background/cards
      200: '#e2e8f0', // Borders/dividers
      300: '#cbd5e1', // Disabled/muted
      400: '#94a3b8', // Secondary text
      500: '#64748b', // Primary text light
      600: '#475569', // Primary text
      700: '#334155', // Primary text dark
      800: '#1e293b', // Primary dark/buttons
      900: '#0f172a', // Darkest/headers
    },
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },

  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },
} as const;

export const STYLES = {
  container: 'bg-slate-50',
  card: 'bg-white rounded-2xl shadow-sm',

  text: {
    heading: 'text-slate-900 font-bold',
    subheading: 'text-slate-700 font-semibold',
    body: 'text-slate-600 font-medium',
    caption: 'text-slate-500 font-medium',
    muted: 'text-slate-400',
  },

  button: {
    primary: 'bg-slate-800 rounded-2xl px-6 py-4 active:bg-slate-900',
    secondary: 'bg-slate-100 rounded-2xl px-6 py-4 active:bg-slate-200',
    ghost: 'rounded-2xl px-4 py-3 active:bg-slate-100',
  },

  input: 'bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900',

  section: 'px-6 py-6',
  padding: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  margin: {
    sm: 'm-4',
    md: 'm-6',
    lg: 'm-8',
  },
} as const;

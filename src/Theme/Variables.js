import theme from './Theme';

// ============================================
// DESIGN SYSTEM - COLORES
// ============================================

// Paleta basada en el gradiente del Login: #126D9B → #3B8D7A → #67B26F

export const Colors = {
  // Brand Principal (basado en gradiente)
  primary: '#126D9B',
  primaryDark: '#0E5A82',
  primaryLight: '#1A7FB0',
  primaryLow: '#126D9B15',

  secondary: '#3B8D7A',
  secondaryDark: '#2E7464',
  secondaryLight: '#4AA08C',
  secondaryLow: '#3B8D7A15',

  accent: '#67B26F',
  accentDark: '#52A05A',
  accentLight: '#7DC284',
  accentLow: '#67B26F15',

  // Aliases (pm = primary, para compatibilidad)
  pm: '#126D9B',
  pmDark: '#0E5A82',
  pmLight: '#3B8D7A',
  pmLow: '#126D9B20',

  // Neutros
  white: '#FFFFFF',
  black: '#000000',

  // Escala de grises (Tailwind-like)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Grises legacy (para compatibilidad)
  grey: '#EAEAEA',
  lowGrey: '#F8F8F8',
  darkGrey: '#878787',
  darkBlue: '#284748',

  // Estados semánticos
  success: '#67B26F',
  successLight: '#E8F5E9',
  successLow: '#67B26F20',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningLow: '#F59E0B20',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerLow: '#EF444420',
  error: '#EF4444',

  info: '#126D9B',
  infoLight: '#E3F2FD',
  infoLow: '#126D9B20',

  // Prioridades
  priorityLow: '#67B26F',
  priorityMedium: '#F59E0B',
  priorityHigh: '#EF4444',

  // Gradientes (explícitos)
  gradientStart: '#126D9B',
  gradientMiddle: '#3B8D7A',
  gradientEnd: '#67B26F',

  // Legacy aliases
  leftBlue: '#126D9B',
  rightGreen: '#67B26F',
  mediterranean: '#3B8D7A',
  greenLight: '#67B26F',

  // Acentos adicionales
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  purpleLow: '#8B5CF620',

  // Teal (complementario)
  teal: '#3B8D7A',
  tealLight: '#E0F2F1',
  tealLow: '#3B8D7A20'
};

export const Variants = {
  info: {
    backgroundColor: `${theme.bgInfo.backgroundColor}30`,
    color: theme.textInfo.color
  },
  pm: {
    backgroundColor: Colors.pmLow,
    color: Colors.pm
  },
  filter: {
    backgroundColor: `${Colors.success}30`,
    color: Colors.black,
    borderColor: Colors.pm
  },
  dangerFilter: {
    backgroundColor: `${Colors.danger}30`,
    color: Colors.black,
    borderColor: Colors.danger
  },
  successFilter: {
    backgroundColor: `${Colors.rightGreen}30`,
    color: Colors.black,
    borderColor: Colors.rightGreen
  },
  warningFilter: {
    backgroundColor: `${Colors.warning}30`,
    color: Colors.black,
    borderColor: Colors.warning
  },
  success: {
    backgroundColor: Colors.successLow,
    color: Colors.success
  },
  warning: {
    backgroundColor: Colors.warningLow,
    color: Colors.warning
  },
  danger: {
    backgroundColor: Colors.dangerLow,
    color: Colors.danger
  },
  purple: {
    backgroundColor: Colors.purpleLow,
    color: Colors.purple
  }
};

export const NavigationColors = {
  primary: Colors.primary,
  background: Colors.gray50,
  card: Colors.white,
  text: Colors.gray800,
  border: Colors.gray200
};

// ============================================
// DESIGN SYSTEM - TIPOGRAFÍA
// ============================================

export const FontSize = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 30,
  '5xl': 36,

  // Legacy (para compatibilidad)
  tiny: 10,
  small: 16,
  regular: 20,
  md2: 25,
  large: 40
};

export const FontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
};

// ============================================
// DESIGN SYSTEM - ESPACIADO
// ============================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48
};

// Metric Sizes (legacy - para compatibilidad)
const tiny = 5;
const small = tiny * 2;
const medium = small * 2;
const regular = tiny * 5;
const large = regular * 2;

export const MetricsSizes = {
  tiny,
  small,
  medium,
  regular,
  large
};

// ============================================
// DESIGN SYSTEM - BORDES
// ============================================

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999
};

// ============================================
// DESIGN SYSTEM - SOMBRAS
// ============================================

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  }
};

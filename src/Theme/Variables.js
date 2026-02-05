import theme from './Theme';

// ============================================
// DESIGN SYSTEM - COLORES
// ============================================

// Paleta principal
export const Colors = {
  // Brand
  pm: '#55A5AD',
  pmDark: '#3E93A8',
  pmLight: '#77C5A2',
  pmLow: '#55A5AD20',

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
  success: '#10B981',
  successLight: '#D1FAE5',
  successLow: '#10B98120',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningLow: '#F59E0B20',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerLow: '#EF444420',
  error: '#EF4444',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoLow: '#3B82F620',

  // Prioridades (legacy)
  priorityLow: '#61C0CD',
  priorityMedium: '#F5C66D',
  priorityHigh: '#ED7A7A',

  // Gradientes
  leftBlue: '#126D9B',
  rightGreen: '#67B26F',
  mediterranean: '#54A3AC',
  greenLight: '#77C5A2',

  // Acentos
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  purpleLow: '#8B5CF620',
};

export const Variants = {
  info: {
    backgroundColor: `${theme.bgInfo.backgroundColor}30`,
    color: theme.textInfo.color,
  },
  pm: {
    backgroundColor: Colors.pmLow,
    color: Colors.pm,
  },
  filter: {
    backgroundColor: `${Colors.success}30`,
    color: Colors.black,
    borderColor: Colors.pm,
  },
  dangerFilter: {
    backgroundColor: `${Colors.danger}30`,
    color: Colors.black,
    borderColor: Colors.danger,
  },
  successFilter: {
    backgroundColor: `${Colors.rightGreen}30`,
    color: Colors.black,
    borderColor: Colors.rightGreen,
  },
  warningFilter: {
    backgroundColor: `${Colors.warning}30`,
    color: Colors.black,
    borderColor: Colors.warning,
  },
  success: {
    backgroundColor: Colors.successLow,
    color: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warningLow,
    color: Colors.warning,
  },
  danger: {
    backgroundColor: Colors.dangerLow,
    color: Colors.danger,
  },
  purple: {
    backgroundColor: Colors.purpleLow,
    color: Colors.purple,
  },
};

export const NavigationColors = {
  primary: Colors.primary,
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
  large: 40,
};

export const FontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
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
  '4xl': 48,
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
  large,
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
  full: 9999,
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
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

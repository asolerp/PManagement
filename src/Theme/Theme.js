import { StyleSheet } from 'react-native';

// Colores base del gradiente para referencia rápida en Theme
const COLORS = {
  primary: '#126D9B',       // Azul
  secondary: '#3B8D7A',     // Verde-azulado
  accent: '#67B26F',        // Verde
  gray100: '#F3F4F6',
  darkBlue: '#0E5A82',
};

const theme = StyleSheet.create({
  bgGray100: {
    backgroundColor: COLORS.gray100
  },
  bgInfo: {
    backgroundColor: COLORS.secondary
  },
  bgPrimary: {
    backgroundColor: COLORS.primary
  },
  bgSecondary: {
    backgroundColor: COLORS.secondary
  },
  bgAccent: {
    backgroundColor: COLORS.accent
  },
  borderGray200: {
    borderColor: '#e0e0e0'
  },
  borderR0_5: {
    borderRadius: 2
  },
  flex1: {
    flex: 1
  },
  flexGrow: {
    flexGrow: 1
  },
  flexRow: {
    flexDirection: 'row'
  },
  fontSans: {
    fontFamily: 'System'
  },
  fontSansBold: {
    fontFamily: 'System',
    fontWeight: 'bold'
  },
  h6: {
    fontSize: 16,
    height: 24
  },
  itemsCenter: {
    alignItems: 'center'
  },
  justifyCenter: {
    justifyContent: 'center'
  },
  justifyEnd: {
    justifyContent: 'flex-end'
  },
  mB14: {
    marginBottom: 56
  },
  mB3: {
    marginBottom: 12
  },
  mR2: {
    marginRight: 8
  },
  mT2: {
    marginTop: 8
  },
  mY4: {
    marginVertical: 16
  },
  p2: {
    padding: 8
  },
  pL5: {
    paddingLeft: 20
  },
  textCenter: {
    textAlign: 'center'
  },
  textGray600: {
    color: '#757575'
  },
  textInfo: {
    color: COLORS.darkBlue
  },
  textPrimary: {
    color: COLORS.primary
  },
  textSecondary: {
    color: COLORS.secondary
  },
  textAccent: {
    color: COLORS.accent
  },
  textXl: {
    fontSize: 20
  }
});

export default theme;

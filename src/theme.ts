export const colors = {
  bg: '#0A0A0A',
  surface: '#111111',
  card: '#161616',
  ink: '#F2F2F2',
  muted: '#8A8A8A',
  faint: '#5C5C5C',
  line: '#2A2A2A',
  lineStrong: '#3D3D3D',
  primary: '#FFFFFF',
  primaryInk: '#0A0A0A',
  danger: '#F2F2F2',
  success: '#F2F2F2',
  warn: '#C8C8C8',
  oval: 'rgba(242,242,242,0.85)',
};

export const fonts = {
  sans: 'Geist-Regular',
  sansMedium: 'Geist-Medium',
  sansSemi: 'Geist-SemiBold',
  mono: 'GeistMono-Regular',
  monoMedium: 'GeistMono-Medium',
};

export const fontAssets = {
  [fonts.sans]: require('../assets/fonts/Geist-Regular.ttf'),
  [fonts.sansMedium]: require('../assets/fonts/Geist-Medium.ttf'),
  [fonts.sansSemi]: require('../assets/fonts/Geist-SemiBold.ttf'),
  [fonts.mono]: require('../assets/fonts/GeistMono-Regular.ttf'),
  [fonts.monoMedium]: require('../assets/fonts/GeistMono-Medium.ttf'),
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
};

export const stackScreenOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.ink,
  headerTitleStyle: {
    color: colors.ink,
    fontFamily: fonts.sansMedium,
    fontWeight: '500' as const,
    fontSize: 16,
  },
  contentStyle: { backgroundColor: colors.bg },
};

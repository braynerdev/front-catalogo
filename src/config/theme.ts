import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6',
    secondary: '#10B981',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    onBackground: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#374151',
    text: '#000000',
    placeholder: '#6B7280',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    secondary: '#34D399',
    error: '#F87171',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#CBD5E1',
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#334155',
      level3: '#475569',
      level4: '#64748B',
      level5: '#94A3B8',
    },
  },
};

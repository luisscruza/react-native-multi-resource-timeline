import { TimelineTheme } from './types';

export const lightTheme: TimelineTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f9f9f9',
    border: '#e0e0e0',
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      accent: '#8e8e93',
    },
    selection: {
      background: '#e3f2fd',
      border: '#2196f3',
    },
    nowIndicator: '#ff3b30',
    workingHours: {
      working: 'rgba(158, 158, 158, 0.05)',
      nonWorking: 'rgba(158, 158, 158, 0.1)',
    },
    shadows: {
      color: '#000000',
      opacity: 0.1,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
    },
    lineHeight: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
    },
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease-out',
      spring: { damping: 15, stiffness: 200 },
    },
  },
};

export const darkTheme: TimelineTheme = {
  colors: {
    background: '#1c1c1e',
    surface: '#2c2c2e',
    border: '#38383a',
    text: {
      primary: '#ffffff',
      secondary: '#aeaeb2',
      accent: '#8e8e93',
    },
    selection: {
      background: '#1e3a5f',
      border: '#007aff',
    },
    nowIndicator: '#ff453a',
    workingHours: {
      working: 'rgba(76, 175, 80, 0.12)',
      nonWorking: 'rgba(0, 0, 0, 0.08)',
    },
    shadows: {
      color: '#000000',
      opacity: 0.3,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
    },
    lineHeight: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
    },
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease-out',
      spring: { damping: 15, stiffness: 200 },
    },
  },
};

export const getTheme = (theme: 'light' | 'dark' = 'light'): TimelineTheme => {
  return theme === 'dark' ? darkTheme : lightTheme;
};

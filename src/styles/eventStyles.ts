import { StyleSheet } from 'react-native';
import { TimelineTheme } from '../types';

export const createEventStyles = (theme: TimelineTheme) => {
  return StyleSheet.create({
    event: {
      position: 'absolute',
      left: 4,
      right: 4,
      borderRadius: 8,
      marginVertical: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadows.color,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: theme.colors.shadows.opacity,
      shadowRadius: 1.5,
      elevation: 1,
      justifyContent: 'flex-start',
    },
    eventTouchable: {
      flex: 1,
      justifyContent: 'flex-start',
      minHeight: 44, // Accessibility minimum touch target
    },
    eventDot: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    eventTitle: {
      fontWeight: '600',
      color: theme.colors.text.primary,
      paddingLeft: 14,
      includeFontPadding: false,
    },
    eventService: {
      fontWeight: '400',
      color: theme.colors.text.secondary,
      paddingLeft: 14,
      includeFontPadding: false,
    },
    eventTimeTop: {
      color: theme.colors.text.accent,
      fontWeight: '400',
      paddingLeft: 14,
      includeFontPadding: false,
    },
    eventTime: {
      color: theme.colors.text.accent,
      fontWeight: '400',
      marginTop: 'auto',
      paddingLeft: 14,
      includeFontPadding: false,
    },
  });
};

import { Dimensions, StyleSheet } from 'react-native';
import { HOUR_WIDTH } from '../constants';
import { TimelineTheme } from '../types';

const { width } = Dimensions.get('window');

export const createTimelineStyles = (theme: TimelineTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.shadows.color,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.colors.shadows.opacity,
      shadowRadius: 3.84,
      elevation: 5,
    },
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    timeHeaderSpace: {
      width: HOUR_WIDTH,
      height: 80,
      backgroundColor: theme.colors.surface,
    },
    resourceHeader: {
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    avatarContainer: {
      marginBottom: theme.spacing.xs,
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    avatarText: {
      color: theme.colors.text.primary,
      fontWeight: 'bold',
      fontSize: theme.typography.fontSize.lg,
    },
    resourceName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    scrollContainer: {
      flex: 1,
    },
    timelineContainer: {
      flexDirection: 'row',
    },
    timeColumn: {
      width: HOUR_WIDTH,
      backgroundColor: theme.colors.background,
    },
    timeSlot: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRightColor: theme.colors.border,
      borderRightWidth: 1,
    },
    timeText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      textAlign: 'right',
    },
    resourceColumn: {
      // width set dynamically
    },
    timelineArea: {
      position: 'relative',
    },
    timeSlotBackground: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    scrollIndicator: {
      position: 'absolute',
      bottom: 0,
      left: HOUR_WIDTH,
      right: 0,
      height: 3,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 1.5,
    },
    scrollThumb: {
      height: 3,
      backgroundColor: theme.colors.selection.border,
      borderRadius: 1.5,
      opacity: 0.8,
    },
    nowIndicator: {
      position: 'absolute',
      zIndex: 1000,
      flexDirection: 'row',
      alignItems: 'center',
      pointerEvents: 'none',
    },
    nowIndicatorTimeContainer: {
      position: 'absolute',
      left: 4,
      top: -6,
      backgroundColor: theme.colors.nowIndicator,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 8,
      zIndex: 1002,
      minWidth: 50,
      alignItems: 'center',
    },
    nowIndicatorTimeText: {
      color: 'white',
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      textAlign: 'center',
    },
    nowIndicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.nowIndicator,
      marginLeft: HOUR_WIDTH - 4,
      zIndex: 1001,
    },
    nowIndicatorLine: {
      height: 2,
      backgroundColor: theme.colors.nowIndicator,
      opacity: 0.8,
      marginLeft: 0,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.xl,
    },
    errorText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });
};

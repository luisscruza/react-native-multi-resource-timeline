import { useCallback, useMemo } from 'react';
import { createHapticFeedback, HapticFeedback } from '../utils/haptics';

export enum HapticPattern {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
}

interface UseHapticFeedbackProps {
  enabled?: boolean;
}

export const useHapticFeedback = ({ enabled = true }: UseHapticFeedbackProps = {}): HapticFeedback & {
  triggerHaptic: (pattern: HapticPattern) => void;
} => {
  
  const haptics = useMemo(() => createHapticFeedback({ enabled }), [enabled]);
  
  const triggerHaptic = useCallback((pattern: HapticPattern) => {
    if (!enabled) return;

    switch (pattern) {
      case HapticPattern.LIGHT:
        haptics.lightImpact();
        break;
      case HapticPattern.MEDIUM:
        haptics.mediumImpact();
        break;
      case HapticPattern.HEAVY:
        haptics.heavyImpact();
        break;
      case HapticPattern.SUCCESS:
        haptics.successFeedback();
        break;
      case HapticPattern.WARNING:
        haptics.warningFeedback();
        break;
      case HapticPattern.ERROR:
        haptics.errorFeedback();
        break;
      case HapticPattern.SELECTION:
        haptics.selectionFeedback();
        break;
      default:
        haptics.lightImpact();
    }
  }, [enabled, haptics]);

  return {
    ...haptics,
    triggerHaptic,
  };
};

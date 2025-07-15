/**
 * Optional Haptics Utility
 * 
 * Provides haptic feedback functionality with graceful fallback
 * when expo-haptics is not available (non-Expo projects).
 */

// Haptic feedback types
export interface HapticFeedbackOptions {
  enabled: boolean;
}

export interface HapticFeedback {
  lightImpact: () => void;
  mediumImpact: () => void;
  heavyImpact: () => void;
  selectionFeedback: () => void;
  successFeedback: () => void;
  warningFeedback: () => void;
  errorFeedback: () => void;
}

// Try to import expo-haptics, but don't fail if it's not available
let ExpoHaptics: any = null;
try {
  ExpoHaptics = require('expo-haptics');
} catch (error) {
  // expo-haptics not available - will use fallback
}

/**
 * Creates haptic feedback handlers with optional expo-haptics support
 */
export const createHapticFeedback = (options: HapticFeedbackOptions): HapticFeedback => {
  const { enabled } = options;

  const createFeedback = (hapticFunction?: () => void) => () => {
    if (!enabled) return;
    
    if (ExpoHaptics && hapticFunction) {
      try {
        hapticFunction();
      } catch (error) {
        // Silently fail if haptics don't work
        console.warn('Haptic feedback failed:', error);
      }
    }
    // In non-Expo environments, we could add other haptic implementations here
    // For now, we just silently do nothing
  };

  return {
    lightImpact: createFeedback(ExpoHaptics?.impactAsync ? () => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light) : undefined),
    mediumImpact: createFeedback(ExpoHaptics?.impactAsync ? () => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium) : undefined),
    heavyImpact: createFeedback(ExpoHaptics?.impactAsync ? () => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy) : undefined),
    selectionFeedback: createFeedback(ExpoHaptics?.selectionAsync ? ExpoHaptics.selectionAsync : undefined),
    successFeedback: createFeedback(ExpoHaptics?.notificationAsync ? () => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success) : undefined),
    warningFeedback: createFeedback(ExpoHaptics?.notificationAsync ? () => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning) : undefined),
    errorFeedback: createFeedback(ExpoHaptics?.notificationAsync ? () => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error) : undefined),
  };
};

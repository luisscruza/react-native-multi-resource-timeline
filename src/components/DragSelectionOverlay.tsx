import React, { memo } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DragSelection, DragSelectionOverlayStyle, TimelineTheme } from '../types';

interface DragSelectionOverlayProps {
  dragSelection: DragSelection | null;
  slotHeight: number;
  width: number;
  theme: TimelineTheme;
  resourceId: string;
  overlayStyle?: DragSelectionOverlayStyle;
}

const DragSelectionOverlay: React.FC<DragSelectionOverlayProps> = ({
  dragSelection,
  slotHeight,
  width,
  theme,
  resourceId,
  overlayStyle,
}) => {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const isDragForThisResource = dragSelection?.resourceId === resourceId;
    const targetOpacity = isDragForThisResource ? 1 : 0;
    
    opacity.value = withTiming(targetOpacity, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [dragSelection, resourceId, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!dragSelection || dragSelection.resourceId !== resourceId) {
      return {
        opacity: 0,
        height: 0,
        top: 0,
      };
    }

    const startSlot = Math.min(dragSelection.startSlot, dragSelection.endSlot);
    const endSlot = Math.max(dragSelection.startSlot, dragSelection.endSlot);
    const selectionHeight = (endSlot - startSlot + 1) * slotHeight;
    const topPosition = startSlot * slotHeight;

    // Merge custom styles with defaults
    const defaultBackgroundColor = '#E8F5E8';
    const defaultBorderColor = '#4CAF50';
    const defaultBorderWidth = 2;
    const defaultBorderRadius = 4;

    return {
      opacity: opacity.value,
      height: selectionHeight,
      top: topPosition,
      backgroundColor: withTiming(overlayStyle?.backgroundColor ?? defaultBackgroundColor, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      }),
      borderColor: withTiming(overlayStyle?.borderColor ?? defaultBorderColor, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      }),
      borderWidth: withTiming(overlayStyle?.borderWidth ?? defaultBorderWidth, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      }),
      borderRadius: overlayStyle?.borderRadius ?? defaultBorderRadius,
    };
  });

  if (!dragSelection || dragSelection.resourceId !== resourceId) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 2,
          right: 2,
          width: width - 4,
          zIndex: 1,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
};

export default memo(DragSelectionOverlay);
import { useCallback, useEffect, useState } from 'react';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ANIMATION_DURATIONS, ZOOM_LIMITS } from '../constants';

export const useTimelineZoom = (
  initialHourHeight: number,
  initialEventMinHeight: number,
  initialColumnWidth: number
) => {
  const [currentHourHeight, setCurrentHourHeight] = useState(initialHourHeight);
  const [currentEventMinHeight, setCurrentEventMinHeight] = useState(initialEventMinHeight);
  const [currentColumnWidth, setCurrentColumnWidth] = useState(initialColumnWidth);
  const [baseColumnWidth, setBaseColumnWidth] = useState(initialColumnWidth);

  // Animated values
  const animatedHourHeight = useSharedValue(initialHourHeight);
  const animatedEventMinHeight = useSharedValue(initialEventMinHeight);
  const verticalScale = useSharedValue(1);
  const horizontalScale = useSharedValue(1);
  const baseVerticalScale = useSharedValue(1);
  const baseHorizontalScale = useSharedValue(1);
  const isZooming = useSharedValue(0);

  // Update base column width when initialColumnWidth changes (due to filtering)
  useEffect(() => {
    setBaseColumnWidth(initialColumnWidth);
    setCurrentColumnWidth(initialColumnWidth);
  }, [initialColumnWidth]);

  const handleVerticalZoomChange = useCallback((newZoomLevel: number) => {
    const clampedZoom = Math.max(ZOOM_LIMITS.vertical.min, Math.min(ZOOM_LIMITS.vertical.max, newZoomLevel));
    const newHourHeight = initialHourHeight * clampedZoom;
    const newEventMinHeight = initialEventMinHeight * clampedZoom;
    
    animatedHourHeight.value = withSpring(newHourHeight, {
      damping: 15,
      stiffness: 100,
    });
    animatedEventMinHeight.value = withSpring(newEventMinHeight, {
      damping: 15,
      stiffness: 100,
    });
    
    setCurrentHourHeight(newHourHeight);
    setCurrentEventMinHeight(newEventMinHeight);
  }, [initialHourHeight, initialEventMinHeight, animatedHourHeight, animatedEventMinHeight]);

  const handleHorizontalZoomChange = useCallback((newZoomLevel: number) => {
    const clampedZoom = Math.max(ZOOM_LIMITS.horizontal.min, Math.min(ZOOM_LIMITS.horizontal.max, newZoomLevel));
    const newColumnWidth = baseColumnWidth * clampedZoom;
    
    setCurrentColumnWidth(newColumnWidth);
  }, [baseColumnWidth]);

  const handleLiveVerticalZoomChange = useCallback((newZoomLevel: number) => {
    const clampedZoom = Math.max(ZOOM_LIMITS.vertical.min, Math.min(ZOOM_LIMITS.vertical.max, newZoomLevel));
    const newHourHeight = initialHourHeight * clampedZoom;
    const newEventMinHeight = initialEventMinHeight * clampedZoom;
    
    // Update animated values immediately for live feedback
    animatedHourHeight.value = newHourHeight;
    animatedEventMinHeight.value = newEventMinHeight;
    
    // Also update the state for immediate re-render
    setCurrentHourHeight(newHourHeight);
    setCurrentEventMinHeight(newEventMinHeight);
  }, [initialHourHeight, initialEventMinHeight, animatedHourHeight, animatedEventMinHeight]);

  const handleLiveHorizontalZoomChange = useCallback((newZoomLevel: number) => {
    const clampedZoom = Math.max(ZOOM_LIMITS.horizontal.min, Math.min(ZOOM_LIMITS.horizontal.max, newZoomLevel));
    const newColumnWidth = baseColumnWidth * clampedZoom;
    
    setCurrentColumnWidth(newColumnWidth);
  }, [baseColumnWidth]);

  const resetZoom = useCallback(() => {
    animatedHourHeight.value = withTiming(initialHourHeight, { duration: ANIMATION_DURATIONS.normal });
    animatedEventMinHeight.value = withTiming(initialEventMinHeight, { duration: ANIMATION_DURATIONS.normal });
    
    setCurrentHourHeight(initialHourHeight);
    setCurrentEventMinHeight(initialEventMinHeight);
    setCurrentColumnWidth(baseColumnWidth);
  }, [initialHourHeight, initialEventMinHeight, baseColumnWidth, animatedHourHeight, animatedEventMinHeight]);

  return {
    currentHourHeight,
    currentEventMinHeight,
    currentColumnWidth,
    animatedHourHeight,
    animatedEventMinHeight,
    verticalScale,
    horizontalScale,
    baseVerticalScale,
    baseHorizontalScale,
    isZooming,
    handleVerticalZoomChange,
    handleHorizontalZoomChange,
    handleLiveVerticalZoomChange,
    handleLiveHorizontalZoomChange,
    resetZoom,
  };
};

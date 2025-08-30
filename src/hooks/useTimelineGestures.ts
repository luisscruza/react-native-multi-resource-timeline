import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { ZOOM_LIMITS, PERFORMANCE } from '../constants';

interface UseTimelineGesturesProps {
  slotHeight: number;
  timeSlots: any[];
  resources: any[];
  currentDragSelection: any;
  startDragSelection: (resourceId: string, slotIndex: number) => void;
  updateDragSelection: (endSlot: number) => void;
  completeDragSelection: () => void;
  handleLiveVerticalZoomChange: (zoom: number) => void;
  handleLiveHorizontalZoomChange: (zoom: number) => void;
  handleVerticalZoomChange: (zoom: number) => void;
  handleHorizontalZoomChange: (zoom: number) => void;
  disableHorizontalZoom?: boolean;
  enableSingleTapSelection?: boolean;
  onSingleTapSelection?: (resourceId: string, slotIndex: number) => void;
}

export const useTimelineGestures = ({
  slotHeight,
  timeSlots,
  resources,
  currentDragSelection,
  startDragSelection,
  updateDragSelection,
  completeDragSelection,
  handleLiveVerticalZoomChange,
  handleLiveHorizontalZoomChange,
  handleVerticalZoomChange,
  handleHorizontalZoomChange,
  disableHorizontalZoom = false,
  enableSingleTapSelection = false,
  onSingleTapSelection,
}: UseTimelineGesturesProps) => {
  // Throttled zoom update to prevent excessive calls
  const lastZoomUpdate = useSharedValue(0);
  const ZOOM_THROTTLE_MS = PERFORMANCE.zoomThrottle; // ~30fps for zoom updates
  
  // Shared values for pinch gesture
  // Shared values for pinch gesture
  const baseVerticalScale = useSharedValue(1);
  const baseHorizontalScale = useSharedValue(1);
  const currentVerticalScale = useSharedValue(1);
  const currentHorizontalScale = useSharedValue(1);
  const pinchDirection = useSharedValue<'none' | 'vertical' | 'horizontal'>('none');
  const isZooming = useSharedValue(0);
  const isDragActive = useSharedValue(false);

  // Create scroll gesture that gets disabled during drag - improved for Android  
  const scrollGesture = Gesture.Native()
    .shouldCancelWhenOutside(false);

  // Optimized pinch gesture handler using the new Gesture API - Android-friendly
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      baseVerticalScale.value = 1;
      baseHorizontalScale.value = 1;
      pinchDirection.value = 'none';
      isZooming.value = 1;
    })
    .onUpdate((event) => {
      'worklet';
      
      // Safety check for Android - prevent crashes when pointers become invalid
      if (!event.scale || event.scale <= 0) {
        return;
      }
      
      // Determine pinch direction based on scale change
      if (pinchDirection.value === 'none' && Math.abs(event.scale - 1) > 0.05) {
        // Default to vertical zoom for most cases to keep it simple and stable
        pinchDirection.value = 'vertical';
      }
      
      // Apply zoom based on direction with throttling
      const now = Date.now();
      const shouldUpdate = now - lastZoomUpdate.value >= ZOOM_THROTTLE_MS;
      
      if (pinchDirection.value === 'vertical' && shouldUpdate) {
        const scale = Math.max(0.5, Math.min(3.0, event.scale)); // Clamp scale values
        currentVerticalScale.value = baseVerticalScale.value * scale;
        const newZoom = Math.max(ZOOM_LIMITS.vertical.min, Math.min(ZOOM_LIMITS.vertical.max, currentVerticalScale.value));
        runOnJS(handleLiveVerticalZoomChange)(newZoom);
        lastZoomUpdate.value = now;
      } else if (pinchDirection.value === 'horizontal' && !disableHorizontalZoom && shouldUpdate) {
        const scale = Math.max(0.5, Math.min(3.0, event.scale)); // Clamp scale values
        currentHorizontalScale.value = baseHorizontalScale.value * scale;
        const newZoom = Math.max(ZOOM_LIMITS.horizontal.min, Math.min(ZOOM_LIMITS.horizontal.max, currentHorizontalScale.value));
        runOnJS(handleLiveHorizontalZoomChange)(newZoom);
        lastZoomUpdate.value = now;
      }
    })
    .onEnd(() => {
      'worklet';
      if (pinchDirection.value === 'vertical') {
        const newZoom = Math.max(ZOOM_LIMITS.vertical.min, Math.min(ZOOM_LIMITS.vertical.max, currentVerticalScale.value));
        runOnJS(handleVerticalZoomChange)(newZoom);
        currentVerticalScale.value = 1;
      } else if (pinchDirection.value === 'horizontal' && !disableHorizontalZoom) {
        const newZoom = Math.max(ZOOM_LIMITS.horizontal.min, Math.min(ZOOM_LIMITS.horizontal.max, currentHorizontalScale.value));
        runOnJS(handleHorizontalZoomChange)(newZoom);
        currentHorizontalScale.value = 1;
      }
      
      isZooming.value = 0;
      pinchDirection.value = 'none';
    })
    .onFinalize(() => {
      'worklet';
      // Reset state on gesture finalization for Android stability
      isZooming.value = 0;
      pinchDirection.value = 'none';
    })
    .runOnJS(false);

  // Optimized drag gesture factory - Android-friendly
  const createDragGesture = useCallback((resourceIndex: number) => {
    return Gesture.Pan()
      .activateAfterLongPress(150) // Reduced from 200ms for better Android responsiveness
      .maxPointers(1)
      .minDistance(3) // Reduced from 5 for better Android sensitivity
      .shouldCancelWhenOutside(false)
      .onBegin(() => {
        'worklet';
        isDragActive.value = false;
      })
      .onStart((event) => {
        'worklet';
        isDragActive.value = true;
        
        // Add safety checks for Android
        if (!event.y || !slotHeight || slotHeight <= 0) {
          return;
        }
        
        const slotIndex = Math.floor(event.y / slotHeight);
        const clampedSlotIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
        const resource = resources[resourceIndex];
        
        if (resource && resource.id) {
          runOnJS(startDragSelection)(resource.id, clampedSlotIndex);
        }
      })
      .onUpdate((event) => {
        'worklet';
        if (!isDragActive.value || !event.y || !slotHeight || slotHeight <= 0) return;
        
        const slotIndex = Math.floor(event.y / slotHeight);
        const clampedSlotIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
        
        runOnJS(updateDragSelection)(clampedSlotIndex);
      })
      .onEnd(() => {
        'worklet';
        if (isDragActive.value) {
          isDragActive.value = false;
          runOnJS(completeDragSelection)();
        }
      })
      .onFinalize(() => {
        'worklet';
        isDragActive.value = false;
      })
      .simultaneousWithExternalGesture(scrollGesture) // Changed from blocksExternalGesture for Android
      .requireExternalGestureToFail(pinchGesture);
  }, [slotHeight, timeSlots.length, resources, startDragSelection, updateDragSelection, completeDragSelection, scrollGesture, pinchGesture, isDragActive]);

  // Single tap gesture factory for immediate selection
  const createTapGesture = useCallback((resourceIndex: number) => {
    if (!enableSingleTapSelection || !onSingleTapSelection) {
      return null;
    }
    
    return Gesture.Tap()
      .maxDuration(300)
      .onStart((event) => {
        'worklet';
        const slotIndex = Math.floor(event.y / slotHeight);
        const clampedSlotIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
        const resource = resources[resourceIndex];
        
        runOnJS(onSingleTapSelection)(resource.id, clampedSlotIndex);
      });
  }, [enableSingleTapSelection, onSingleTapSelection, slotHeight, timeSlots.length, resources]);

  // Combined gesture factory that includes both drag and tap when enabled
  const createCombinedGesture = useCallback((resourceIndex: number) => {
    const dragGesture = createDragGesture(resourceIndex);
    const tapGesture = createTapGesture(resourceIndex);
    
    if (tapGesture) {
      return Gesture.Exclusive(dragGesture, tapGesture);
    }
    
    return dragGesture;
  }, [createDragGesture, createTapGesture]);

  return {
    pinchGesture,
    scrollGesture,
    createDragGesture,
    createTapGesture,
    createCombinedGesture,
    isZooming,
    isDragActive,
  };
};

import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
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
  const verticalScale = useSharedValue(1);
  const horizontalScale = useSharedValue(1);
  const baseVerticalScale = useSharedValue(1);
  const baseHorizontalScale = useSharedValue(1);
  const initialFocalX = useSharedValue(0);
  const initialFocalY = useSharedValue(0);
  const pinchDirection = useSharedValue<'none' | 'vertical' | 'horizontal'>('none');
  const isZooming = useSharedValue(0);
  const isDragActive = useSharedValue(false);

  // Create scroll gesture that gets disabled during drag
  const scrollGesture = Gesture.Native().shouldCancelWhenOutside(false);

  const pinchHandler = Gesture.Pinch()
    .onBegin((event) => {
      'worklet';
      baseVerticalScale.value = 1;
      baseHorizontalScale.value = 1;
      initialFocalX.value = event.focalX;
      initialFocalY.value = event.focalY;
      pinchDirection.value = 'none';
      isZooming.value = 1;
    })
    .onChange((event) => {
      'worklet';
      
      const deltaX = Math.abs(event.focalX - initialFocalX.value);
      const deltaY = Math.abs(event.focalY - initialFocalY.value);
      
      // Determine pinch direction
      if (pinchDirection.value === 'none' && event.scale !== 1) {
        if (deltaX > deltaY && !disableHorizontalZoom) {
          pinchDirection.value = 'horizontal';
        } else {
          pinchDirection.value = 'vertical';
        }
      }
      
      // Default to vertical after small movement
      if (pinchDirection.value === 'none' && (deltaX > 5 || deltaY > 5)) {
        pinchDirection.value = 'vertical';
      }
      
      // Apply zoom based on direction with throttling
      const now = Date.now();
      const shouldUpdate = now - lastZoomUpdate.value >= ZOOM_THROTTLE_MS;
      
      if (pinchDirection.value === 'vertical' && shouldUpdate) {
        verticalScale.value = baseVerticalScale.value * event.scale;
        const newZoom = Math.max(ZOOM_LIMITS.vertical.min, Math.min(ZOOM_LIMITS.vertical.max, verticalScale.value));
        scheduleOnRN(handleLiveVerticalZoomChange, newZoom);
        lastZoomUpdate.value = now;
      } else if (pinchDirection.value === 'horizontal' && !disableHorizontalZoom && shouldUpdate) {
        horizontalScale.value = baseHorizontalScale.value * event.scale;
        const newZoom = Math.max(ZOOM_LIMITS.horizontal.min, Math.min(ZOOM_LIMITS.horizontal.max, horizontalScale.value));
        scheduleOnRN(handleLiveHorizontalZoomChange, newZoom);
        lastZoomUpdate.value = now;
      }
    })
    .onEnd(() => {
      'worklet';
      if (pinchDirection.value === 'vertical') {
        const newZoom = Math.max(ZOOM_LIMITS.vertical.min, Math.min(ZOOM_LIMITS.vertical.max, verticalScale.value));
        scheduleOnRN(handleVerticalZoomChange, newZoom);
        verticalScale.value = 1;
      } else if (pinchDirection.value === 'horizontal' && !disableHorizontalZoom) {
        const newZoom = Math.max(ZOOM_LIMITS.horizontal.min, Math.min(ZOOM_LIMITS.horizontal.max, horizontalScale.value));
        scheduleOnRN(handleHorizontalZoomChange, newZoom);
        horizontalScale.value = 1;
      }
      
      isZooming.value = 0;
      pinchDirection.value = 'none';
    });

  // Optimized drag gesture factory using modern Gesture API
  const createDragGesture = useCallback((resourceIndex: number) => {
    return Gesture.Pan()
      .activateAfterLongPress(200)
      .maxPointers(1)
      .minDistance(5)
      .shouldCancelWhenOutside(false)
      .onBegin(() => {
        'worklet';
        isDragActive.value = false;
      })
      .onStart((event) => {
        'worklet';
        isDragActive.value = true;
        
        const slotIndex = Math.floor(event.y / slotHeight);
        const clampedSlotIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
        const resource = resources[resourceIndex];
        
        scheduleOnRN(startDragSelection, resource.id, clampedSlotIndex);
      })
      .onChange((event) => {
        'worklet';
        const slotIndex = Math.floor(event.y / slotHeight);
        const clampedSlotIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
        
        scheduleOnRN(updateDragSelection, clampedSlotIndex);
      })
      .onEnd(() => {
        'worklet';
        isDragActive.value = false;
        scheduleOnRN(completeDragSelection);
      })
      .onFinalize(() => {
        'worklet';
        isDragActive.value = false;
      })
      .blocksExternalGesture(scrollGesture);
  }, [slotHeight, timeSlots.length, resources, startDragSelection, updateDragSelection, completeDragSelection, scrollGesture]);

  // Single tap gesture factory for immediate selection using modern Gesture API
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
        
        scheduleOnRN(onSingleTapSelection, resource.id, clampedSlotIndex);
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
    pinchHandler,
    scrollGesture,
    createDragGesture,
    createTapGesture,
    createCombinedGesture,
    isZooming,
    isDragActive,
  };
};

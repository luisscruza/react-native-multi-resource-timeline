import { useCallback, useState } from 'react';
import { DragSelection } from '../types';

// Simple shared value implementation for non-reanimated environments
interface SharedValue<T> {
  value: T;
}

const createSharedValue = <T>(initialValue: T): SharedValue<T> => ({
  value: initialValue,
});

export const useTimelineSelection = (clearAfterDrag: boolean = true) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ resourceId: string; hourIndex: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
  
  const currentDragSelection = createSharedValue<DragSelection | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedTimeSlot(null);
    setIsDragging(false);
    setDragSelection(null);
    currentDragSelection.value = null;
  }, []);

  const clearDragSelection = useCallback(() => {
    setIsDragging(false);
    setDragSelection(null);
    currentDragSelection.value = null;
  }, []);

  const handleTimeSlotPress = useCallback((resourceId: string, slotIndex: number) => {
    clearSelection();
    setSelectedTimeSlot({ resourceId, hourIndex: slotIndex });
  }, [clearSelection]);

  const startDragSelection = useCallback((resourceId: string, slotIndex: number) => {
    const dragData: DragSelection = {
      resourceId,
      startSlot: slotIndex,
      endSlot: slotIndex,
    };
    
    setIsDragging(true);
    setSelectedTimeSlot(null);
    setDragSelection(dragData);
    currentDragSelection.value = dragData;
  }, []);

  const updateDragSelection = useCallback((endSlot: number) => {
    if (currentDragSelection.value) {
      const updatedDragData = {
        ...currentDragSelection.value,
        endSlot,
      };
      
      currentDragSelection.value = updatedDragData;
      setDragSelection(updatedDragData);
    }
  }, []);

  // Enhanced completion callback that converts slot indices to time-based information
  const completeDragSelection = useCallback((
    onComplete?: (resourceId: string, startSlot: number, endSlot: number) => void,
    selectionSlots?: Array<{ hours: number; minutes: number; index: number }>,
    timeSlotInterval?: number,
    startHour?: number,
    selectionGranularity?: number
  ) => {
    const dragData = dragSelection || currentDragSelection.value;
    
    if (dragData && onComplete) {
      const { resourceId, startSlot, endSlot } = dragData;
      const normalizedStartSlot = Math.min(startSlot, endSlot);
      const normalizedEndSlot = Math.max(startSlot, endSlot);
      
      setIsDragging(false);
      
      // If we have selection slots context, convert to time-based indices
      if (selectionSlots && timeSlotInterval && startHour !== undefined && selectionGranularity !== undefined) {
        const convertedIndices = convertSelectionSlotsToTimeSlots(
          normalizedStartSlot,
          normalizedEndSlot,
          selectionSlots,
          timeSlotInterval,
          selectionGranularity,
          startHour
        );
        
        onComplete(resourceId, convertedIndices.startSlot, convertedIndices.endSlot);
      } else {
        // Fallback to raw indices for backward compatibility
        onComplete(resourceId, normalizedStartSlot, normalizedEndSlot);
      }
      
      // Auto-clear after completion if enabled
      if (clearAfterDrag) {
        setTimeout(() => {
          clearDragSelection();
        }, 100); // Small delay to prevent visual glitch
      }
    } else {
      clearSelection();
    }
  }, [dragSelection, clearSelection, clearDragSelection, clearAfterDrag]);

  return {
    selectedTimeSlot,
    isDragging,
    dragSelection,
    currentDragSelection,
    clearSelection,
    clearDragSelection,
    handleTimeSlotPress,
    startDragSelection,
    updateDragSelection,
    completeDragSelection,
  };
};

/**
 * Converts selection slot indices to consumer-compatible indices 
 * Returns indices that represent the actual selected times in terms of selectionGranularity
 */
function convertSelectionSlotsToTimeSlots(
  startSelectionSlot: number,
  endSelectionSlot: number,
  selectionSlots: Array<{ hours: number; minutes: number; index: number }>,
  timeSlotInterval: number,
  selectionGranularity: number,
  startHour: number
): { startSlot: number; endSlot: number } {
  // Get the actual times from selection slots
  const startTime = selectionSlots[startSelectionSlot];
  const endTime = selectionSlots[endSelectionSlot];
  
  if (!startTime || !endTime) {
    // Fallback to original indices if conversion fails
    return { startSlot: startSelectionSlot, endSlot: endSelectionSlot };
  }
  
  // Convert times to indices based on the actual selectionGranularity
  // This preserves the exact granular times selected by the user
  const startTimeSlotIndex = timeToGranularIndex(startTime.hours, startTime.minutes, startHour, selectionGranularity);
  const endTimeSlotIndex = timeToGranularIndex(endTime.hours, endTime.minutes, startHour, selectionGranularity);
  
  return {
    startSlot: startTimeSlotIndex,
    endSlot: endTimeSlotIndex,
  };
}

/**
 * Convert time to index based on the actual selection granularity
 * This returns indices that, when multiplied by selectionGranularity, give the exact selected time
 */
function timeToGranularIndex(
  hours: number,
  minutes: number,
  startHour: number,
  selectionGranularity: number
): number {
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = startHour * 60;
  const offsetMinutes = totalMinutes - startMinutes;
  
  // Return index based on actual selection granularity
  // This way: index * selectionGranularity = offsetMinutes = correct time offset
  return Math.floor(offsetMinutes / selectionGranularity);
}

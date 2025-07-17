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

  const completeDragSelection = useCallback((onComplete?: (resourceId: string, startSlot: number, endSlot: number) => void) => {
    const dragData = dragSelection || currentDragSelection.value;
    
    if (dragData && onComplete) {
      const { resourceId, startSlot, endSlot } = dragData;
      setIsDragging(false);
      onComplete(resourceId, Math.min(startSlot, endSlot), Math.max(startSlot, endSlot));
      
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

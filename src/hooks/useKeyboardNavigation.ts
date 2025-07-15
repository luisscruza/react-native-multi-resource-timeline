import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

interface UseKeyboardNavigationProps {
  resources: any[];
  timeSlots: any[];
  onTimeSlotSelect: (resourceId: string, startSlot: number, endSlot: number) => void;
  onEventPress?: (event: any) => void;
}

export const useKeyboardNavigation = ({
  resources,
  timeSlots,
  onTimeSlotSelect,
  onEventPress,
}: UseKeyboardNavigationProps) => {
  const [focusedResource, setFocusedResource] = useState(0);
  const [focusedTimeSlot, setFocusedTimeSlot] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    resourceIndex: number;
    timeSlotIndex: number;
  } | null>(null);

  // Keyboard visibility listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  // Handle keyboard input
  const handleKeyPress = useCallback((event: any) => {
    if (!isKeyboardVisible && Platform.OS === 'web') {
      const { key } = event.nativeEvent;
      
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          setFocusedTimeSlot(prev => Math.max(0, prev - 1));
          break;
          
        case 'ArrowDown':
          event.preventDefault();
          setFocusedTimeSlot(prev => Math.min(timeSlots.length - 1, prev + 1));
          break;
          
        case 'ArrowLeft':
          event.preventDefault();
          setFocusedResource(prev => Math.max(0, prev - 1));
          break;
          
        case 'ArrowRight':
          event.preventDefault();
          setFocusedResource(prev => Math.min(resources.length - 1, prev + 1));
          break;
          
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (selectionStart) {
            // Complete selection
            const startSlot = Math.min(selectionStart.timeSlotIndex, focusedTimeSlot);
            const endSlot = Math.max(selectionStart.timeSlotIndex, focusedTimeSlot);
            onTimeSlotSelect(resources[focusedResource].id, startSlot, endSlot);
            setSelectionStart(null);
          } else {
            // Start selection
            setSelectionStart({
              resourceIndex: focusedResource,
              timeSlotIndex: focusedTimeSlot,
            });
          }
          break;
          
        case 'Escape':
          event.preventDefault();
          setSelectionStart(null);
          break;
          
        case 'Tab':
          // Let default tab behavior work for accessibility
          break;
          
        default:
          break;
      }
    }
  }, [
    isKeyboardVisible,
    focusedResource,
    focusedTimeSlot,
    selectionStart,
    resources,
    timeSlots,
    onTimeSlotSelect,
  ]);

  // Focus management
  const getFocusProps = useCallback((resourceIndex: number, timeSlotIndex: number) => {
    const isFocused = focusedResource === resourceIndex && focusedTimeSlot === timeSlotIndex;
    const isInSelection = selectionStart && 
      selectionStart.resourceIndex === resourceIndex &&
      timeSlotIndex >= Math.min(selectionStart.timeSlotIndex, focusedTimeSlot) &&
      timeSlotIndex <= Math.max(selectionStart.timeSlotIndex, focusedTimeSlot);

    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: `${resources[resourceIndex]?.name} at ${timeSlots[timeSlotIndex]?.hours}:${timeSlots[timeSlotIndex]?.minutes.toString().padStart(2, '0')}`,
      accessibilityHint: isFocused ? 'Press Enter to select, use arrow keys to navigate' : 'Navigate here with arrow keys',
      accessibilityState: {
        focused: isFocused,
        selected: isInSelection,
      },
      onFocus: () => {
        setFocusedResource(resourceIndex);
        setFocusedTimeSlot(timeSlotIndex);
      },
    };
  }, [focusedResource, focusedTimeSlot, selectionStart, resources, timeSlots]);

  // Programmatic focus methods
  const focusTimeSlot = useCallback((resourceIndex: number, timeSlotIndex: number) => {
    setFocusedResource(resourceIndex);
    setFocusedTimeSlot(timeSlotIndex);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionStart(null);
  }, []);

  return {
    focusedResource,
    focusedTimeSlot,
    selectionStart,
    isKeyboardVisible,
    handleKeyPress,
    getFocusProps,
    focusTimeSlot,
    clearSelection,
    setFocusedResource,
    setFocusedTimeSlot,
  };
};

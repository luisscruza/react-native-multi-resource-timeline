import React, { memo, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useEventPositioning } from '../hooks/useEventPositioning';
import { createTimelineStyles } from '../styles/timelineStyles';
import { DragSelection, DragSelectionOverlayStyle, MultiResourceEvent, Resource, TimelineTheme, TimeSlot, WorkingHoursStyle } from '../types';
import { WorkingSlots } from '../utils/workingHoursParser';
import DragSelectionOverlay from './DragSelectionOverlay';
import TimelineEvent from './TimelineEvent';
import WorkingHoursBackground from './WorkingHoursBackground';

interface ResourceColumnProps {
  resource: Resource;
  resourceIndex: number;
  events: MultiResourceEvent[];
  timeSlots: TimeSlot[];
  slotHeight: number;
  selectionHeight: number;
  width: number;
  date: string;
  startHour: number;
  hourHeight: number;
  eventMinHeight: number;
  selectedTimeSlot: { resourceId: string; hourIndex: number } | null;
  dragSelection: DragSelection | null;
  dragGesture: any;
  onEventPress?: (event: MultiResourceEvent) => void;
  theme: TimelineTheme;
  showWorkingHoursBackground?: boolean;
  workingHoursStyle?: WorkingHoursStyle;
  workingSlots?: WorkingSlots;
  dragSelectionOverlayStyle?: DragSelectionOverlayStyle;
}

const ResourceColumnComponent: React.FC<ResourceColumnProps> = ({
  resource,
  resourceIndex,
  events,
  timeSlots,
  slotHeight,
  selectionHeight,
  width,
  date,
  startHour,
  hourHeight,
  eventMinHeight,
  selectedTimeSlot,
  dragSelection,
  dragGesture,
  onEventPress,
  theme,
  showWorkingHoursBackground = false,
  workingHoursStyle,
  workingSlots,
  dragSelectionOverlayStyle,
}) => {
  const styles = createTimelineStyles(theme);
  const { getEventPosition, getEventStyling } = useEventPositioning({
    events,
    date,
    startHour,
    hourHeight,
    eventMinHeight,
  });

  // Optimize event filtering with better memoization
  const resourceEvents = useMemo(() => {
    const filtered = events.filter(event => event.resourceId === resource.id);
    return filtered;
  }, [events, resource.id]);

  // Optimize animated styles - create only one set of shared styles instead of per-slot
  const baseOpacity = useSharedValue(0);
  const selectionState = useSharedValue({
    selectedSlot: -1,
    dragStartSlot: -1,
    dragEndSlot: -1,
    resourceSelected: false,
  });

  // Update shared values when props change with cleanup
  React.useEffect(() => {
    const timer = setTimeout(() => {
      baseOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [baseOpacity]);

  React.useEffect(() => {
    const isResourceSelected = selectedTimeSlot?.resourceId === resource.id;
    const selectedSlot = isResourceSelected ? (selectedTimeSlot?.hourIndex ?? -1) : -1;
    
    // Batch the update to prevent excessive animations
    const timer = setTimeout(() => {
      selectionState.value = {
        selectedSlot,
        dragStartSlot: -1, // No longer needed for individual slot styling
        dragEndSlot: -1,   // No longer needed for individual slot styling
        resourceSelected: isResourceSelected,
      };
    }, 16); // One frame delay to batch updates

    return () => clearTimeout(timer);
  }, [selectedTimeSlot, resource.id, selectionState]);

  // Create a single animated style function that we'll use for each slot
  const getSlotAnimatedStyle = useCallback((slotIndex: number) => 
    useAnimatedStyle(() => {
      const { selectedSlot, resourceSelected } = selectionState.value;
      
      const isSelected = resourceSelected && selectedSlot === slotIndex;
      
      const borderWidth = withSpring(isSelected ? 2 : 0, {
        damping: 15,
        stiffness: 300,
      });
      
      // Check if this slot is during working hours
      const isWorkingSlot = workingSlots?.isWorking[slotIndex] ?? true;
      
      const backgroundColor = withTiming(
        isSelected ? theme.colors.selection.background : 
        isWorkingSlot ? theme.colors.surface : 'transparent',
        {
          duration: 200,
          easing: Easing.out(Easing.quad),
        }
      );
      
      const borderColor = withTiming(
        isSelected ? theme.colors.selection.border : 'transparent', 
        {
          duration: 200,
          easing: Easing.out(Easing.quad),
        }
      );
      
      return {
        opacity: baseOpacity.value,
        borderWidth,
        backgroundColor,
        borderColor,
      };
    }), [selectionState, baseOpacity, workingSlots, theme]
  );

  return (
    <View 
      style={[styles.resourceColumn, { width }]}
      accessibilityRole="list"
      accessibilityLabel={`${resource.name} schedule`}
    >
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.timelineArea, { height: timeSlots.length * slotHeight }]}>
          {/* Working Hours Background */}
          {showWorkingHoursBackground && (
            <WorkingHoursBackground
              workingSlots={workingSlots}
              slotHeight={slotHeight}
              theme={theme}
              style={workingHoursStyle}
              width={width}
              totalSlots={timeSlots.length}
            />
          )}
          
          {/* Time slot backgrounds */}
          {timeSlots.map((slot, index) => {
            const SlotAnimatedComponent = React.memo(() => {
              const animatedStyle = getSlotAnimatedStyle(index);
              return (
                <Animated.View
                  style={[
                    styles.timeSlotBackground,
                    {
                      height: slotHeight - 2,
                      top: index * slotHeight,
                      margin: 1,
                    },
                    animatedStyle,
                  ]}
                  accessible={true}
                  accessibilityLabel={`Time slot ${slot.hours}:${slot.minutes.toString().padStart(2, '0')}`}
                />
              );
            });
            SlotAnimatedComponent.displayName = `SlotAnimatedComponent-${index}`;
            
            return (
              <SlotAnimatedComponent
                key={`${slot.hours}-${slot.minutes}-slot`}
              />
            );
          })}

          {/* Drag Selection Overlay */}
          <DragSelectionOverlay
            dragSelection={dragSelection}
            slotHeight={slotHeight}
            selectionHeight={selectionHeight}
            width={width}
            theme={theme}
            resourceId={resource.id}
            overlayStyle={dragSelectionOverlayStyle}
          />
        
          {/* Events */}
          {resourceEvents.map((event, index) => {
            const position = getEventPosition(event, resourceEvents);
            const styling = getEventStyling(event, resourceEvents);
            
            return (
              <TimelineEvent
                key={`${event.resourceId}-${event.start}-${event.title}-${index}`}
                event={event}
                position={position}
                styling={styling}
                date={date}
                onPress={onEventPress}
                theme={theme}
              />
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// Enhanced comparison function to optimize re-renders, especially during horizontal scrolling
const arePropsEqual = (prevProps: ResourceColumnProps, nextProps: ResourceColumnProps) => {
  // Fast path: check if it's the same resource instance
  if (prevProps.resource === nextProps.resource && 
      prevProps.resourceIndex === nextProps.resourceIndex &&
      prevProps.width === nextProps.width &&
      prevProps.slotHeight === nextProps.slotHeight) {
    
    // Check only critical state that affects rendering
    const prevSelected = prevProps.selectedTimeSlot?.resourceId === prevProps.resource.id;
    const nextSelected = nextProps.selectedTimeSlot?.resourceId === nextProps.resource.id;
    const prevDragForThisResource = prevProps.dragSelection?.resourceId === prevProps.resource.id;
    const nextDragForThisResource = nextProps.dragSelection?.resourceId === nextProps.resource.id;
    
    // If no selection states apply to this resource, skip expensive event comparison
    if (!prevSelected && !nextSelected && !prevDragForThisResource && !nextDragForThisResource) {
      // Only check if events array reference changed (shallow comparison)
      return prevProps.events === nextProps.events && 
             prevProps.timeSlots === nextProps.timeSlots;
    }
  }
  
  // Full comparison for resources that might need updates
  // Check if resource changed (deep comparison)
  if (prevProps.resource.id !== nextProps.resource.id ||
      prevProps.resource.name !== nextProps.resource.name ||
      prevProps.resource.color !== nextProps.resource.color) {
    return false;
  }
  
  // Check if layout props changed
  if (prevProps.width !== nextProps.width ||
      prevProps.slotHeight !== nextProps.slotHeight ||
      prevProps.selectionHeight !== nextProps.selectionHeight ||
      prevProps.hourHeight !== nextProps.hourHeight ||
      prevProps.eventMinHeight !== nextProps.eventMinHeight) {
    return false;
  }
  
  // Check if events for this resource changed
  const prevResourceEvents = prevProps.events.filter(e => e.resourceId === prevProps.resource.id);
  const nextResourceEvents = nextProps.events.filter(e => e.resourceId === nextProps.resource.id);
  
  if (prevResourceEvents.length !== nextResourceEvents.length) {
    return false;
  }
  
  // Quick check for event changes
  for (let i = 0; i < prevResourceEvents.length; i++) {
    const prevEvent = prevResourceEvents[i];
    const nextEvent = nextResourceEvents[i];
    if (prevEvent.id !== nextEvent.id ||
        prevEvent.start !== nextEvent.start ||
        prevEvent.end !== nextEvent.end ||
        prevEvent.title !== nextEvent.title) {
      return false;
    }
  }
  
  // Check selection state
  const prevSelected = prevProps.selectedTimeSlot?.resourceId === prevProps.resource.id;
  const nextSelected = nextProps.selectedTimeSlot?.resourceId === nextProps.resource.id;
  
  if (prevSelected !== nextSelected ||
      (prevSelected && prevProps.selectedTimeSlot?.hourIndex !== nextProps.selectedTimeSlot?.hourIndex)) {
    return false;
  }
  
  // Check if drag selection for this resource changed (for overlay)
  const prevDragForThisResource = prevProps.dragSelection?.resourceId === prevProps.resource.id;
  const nextDragForThisResource = nextProps.dragSelection?.resourceId === nextProps.resource.id;
  
  if (prevDragForThisResource !== nextDragForThisResource) {
    return false;
  }
  
  if (prevDragForThisResource && nextDragForThisResource) {
    if (prevProps.dragSelection!.startSlot !== nextProps.dragSelection!.startSlot ||
        prevProps.dragSelection!.endSlot !== nextProps.dragSelection!.endSlot) {
      return false;
    }
  }
  
  // Check basic props
  if (prevProps.date !== nextProps.date ||
      prevProps.startHour !== nextProps.startHour ||
      prevProps.showWorkingHoursBackground !== nextProps.showWorkingHoursBackground ||
      prevProps.timeSlots.length !== nextProps.timeSlots.length) {
    return false;
  }
  
  return true;
};

ResourceColumnComponent.displayName = 'ResourceColumn';

const ResourceColumn = ResourceColumnComponent;

export default memo(ResourceColumnComponent, arePropsEqual);

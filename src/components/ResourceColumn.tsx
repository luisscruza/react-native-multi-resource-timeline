import React, { memo, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useEventPositioning } from '../hooks/useEventPositioning';
import { createTimelineStyles } from '../styles/timelineStyles';
import { DragSelection, MultiResourceEvent, Resource, TimelineTheme, TimeSlot, WorkingHoursStyle } from '../types';
import { WorkingSlots } from '../utils/workingHoursParser';
import TimelineEvent from './TimelineEvent';
import WorkingHoursBackground from './WorkingHoursBackground';

interface ResourceColumnProps {
  resource: Resource;
  resourceIndex: number;
  events: MultiResourceEvent[];
  timeSlots: TimeSlot[];
  slotHeight: number;
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
}

const ResourceColumnComponent: React.FC<ResourceColumnProps> = ({
  resource,
  resourceIndex,
  events,
  timeSlots,
  slotHeight,
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

  // Update shared values when props change
  React.useEffect(() => {
    baseOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [baseOpacity]);

  React.useEffect(() => {
    const isResourceSelected = selectedTimeSlot?.resourceId === resource.id;
    const selectedSlot = isResourceSelected ? (selectedTimeSlot?.hourIndex ?? -1) : -1;
    
    const isDragForThisResource = dragSelection?.resourceId === resource.id;
    const dragStartSlot = isDragForThisResource ? dragSelection.startSlot : -1;
    const dragEndSlot = isDragForThisResource ? dragSelection.endSlot : -1;
    
    selectionState.value = {
      selectedSlot,
      dragStartSlot,
      dragEndSlot,
      resourceSelected: isResourceSelected,
    };
  }, [selectedTimeSlot, dragSelection, resource.id, selectionState]);

  // Create a single animated style function that we'll use for each slot
  const getSlotAnimatedStyle = useCallback((slotIndex: number) => 
    useAnimatedStyle(() => {
      const { selectedSlot, dragStartSlot, dragEndSlot, resourceSelected } = selectionState.value;
      
      const isSelected = resourceSelected && selectedSlot === slotIndex;
      const isDragSelected = dragStartSlot !== -1 && dragEndSlot !== -1 &&
        slotIndex >= Math.min(dragStartSlot, dragEndSlot) &&
        slotIndex <= Math.max(dragStartSlot, dragEndSlot);
      
      const borderWidth = withSpring(isSelected ? 2 : isDragSelected ? 1 : 0, {
        damping: 15,
        stiffness: 300,
      });
      
      // Check if this slot is during working hours
      const isWorkingSlot = workingSlots?.isWorking[slotIndex] ?? true;
      
      const backgroundColor = withTiming(
        isSelected ? theme.colors.selection.background : 
        isDragSelected ? '#E8F5E8' : 
        isWorkingSlot ? theme.colors.surface : 'transparent',
        {
          duration: 200,
          easing: Easing.out(Easing.quad),
        }
      );
      
      const borderColor = withTiming(
        isSelected ? theme.colors.selection.border : 
        isDragSelected ? '#4CAF50' : 
        'transparent', 
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
          {showWorkingHoursBackground && workingSlots && (
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
                      borderStyle: 'dotted',
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

// Custom comparison function to optimize re-renders
const arePropsEqual = (prevProps: ResourceColumnProps, nextProps: ResourceColumnProps) => {
  // Check if resource changed (deep comparison)
  if (prevProps.resource.id !== nextProps.resource.id ||
      prevProps.resource.name !== nextProps.resource.name ||
      prevProps.resource.color !== nextProps.resource.color) {
    return false;
  }
  
  // Check if layout props changed
  if (prevProps.width !== nextProps.width ||
      prevProps.slotHeight !== nextProps.slotHeight ||
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
  
  // Check drag selection state
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

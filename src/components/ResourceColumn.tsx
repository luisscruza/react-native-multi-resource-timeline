import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
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

const ResourceColumn = memo<ResourceColumnProps>(({
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

  // Filter events for this resource
  const resourceEvents = useMemo(() => 
    events.filter(event => event.resourceId === resource.id),
    [events, resource.id]
  );

  // Create animated styles at component level (not inside useMemo)
  const resourceTimeSlotAnimatedStyles = timeSlots.map((_, index) => 
    useAnimatedStyle(() => {
      const opacity = withTiming(1, {
        duration: 300 + (index * 50),
        easing: Easing.out(Easing.quad),
      });
      
      return { opacity };
    })
  );

  // Create selection animated styles at component level  
  const timeSlotSelectionAnimatedStyles = timeSlots.map((_, slotIndex) => 
    useAnimatedStyle(() => {
      const isSelected = selectedTimeSlot?.resourceId === resource.id && 
                        selectedTimeSlot?.hourIndex === slotIndex;
      
      const isDragSelected = dragSelection && 
        dragSelection.resourceId === resource.id &&
        slotIndex >= Math.min(dragSelection.startSlot, dragSelection.endSlot) &&
        slotIndex <= Math.max(dragSelection.startSlot, dragSelection.endSlot);
      
      const borderWidth = withSpring(isSelected ? 2 : isDragSelected ? 1 : 0, {
        damping: 15,
        stiffness: 300,
      });
      
      // Check if this slot is during working hours
      const isWorkingSlot = workingSlots?.isWorking[slotIndex] ?? true;
      
      const backgroundColor = withTiming(
        isSelected ? theme.colors.selection.background : 
        isDragSelected ? '#E8F5E8' : 
        isWorkingSlot ? theme.colors.surface : 'transparent', // Transparent for non-working hours
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
        borderWidth,
        backgroundColor,
        borderColor,
      };
    })
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
          {timeSlots.map((slot, index) => (
            <Animated.View
              key={`${slot.hours}-${slot.minutes}-slot`}
              style={[
                styles.timeSlotBackground,
                {
                  height: slotHeight - 2,
                  top: index * slotHeight,
                  borderStyle: 'dotted',
                  margin: 1,
                },
                resourceTimeSlotAnimatedStyles[index],
                timeSlotSelectionAnimatedStyles[index],
              ]}
              accessible={true}
              accessibilityLabel={`Time slot ${slot.hours}:${slot.minutes.toString().padStart(2, '0')}`}
            />
          ))}
        
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
});

ResourceColumn.displayName = 'ResourceColumn';

export default ResourceColumn;

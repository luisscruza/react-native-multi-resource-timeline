import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  Easing, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  useDerivedValue,
  runOnJS
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
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

interface SlotBackgroundData {
  key: string;
  index: number;
  isWorkingSlot: boolean;
  label: string;
}

interface SlotBackgroundProps {
  item: SlotBackgroundData;
  slotHeight: number;
  baseOpacity: Animated.SharedValue<number>;
  selectedSlot: Animated.SharedValue<number>;
  resourceSelected: Animated.SharedValue<boolean>;
  themeColors: {
    selectionBg: string;
    selectionBorder: string;
    surface: string;
  };
}

/**
 * Memoized SlotBackground component to prevent recreation in render loops.
 * Uses reanimated shared values for optimal animation performance.
 */
const SlotBackground = memo<SlotBackgroundProps>(({ 
  item, 
  slotHeight, 
  baseOpacity, 
  selectedSlot, 
  resourceSelected,
  themeColors 
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isSelected = resourceSelected.value && selectedSlot.value === item.index;
    
    const borderWidth = withSpring(isSelected ? 2 : 0, {
      damping: 15,
      stiffness: 300,
    });
    
    const backgroundColor = withTiming(
      isSelected ? themeColors.selectionBg : 
      item.isWorkingSlot ? themeColors.surface : 'transparent',
      {
        duration: 200,
        easing: Easing.out(Easing.quad),
      }
    );
    
    const borderColor = withTiming(
      isSelected ? themeColors.selectionBorder : 'transparent', 
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
      position: 'absolute' as const,
      left: 0,
      right: 0,
      height: slotHeight - 2,
      top: item.index * slotHeight,
      margin: 1,
      borderRadius: 8,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      accessible={true}
      accessibilityLabel={item.label}
    />
  );
});

SlotBackground.displayName = 'SlotBackground';

/**
 * Optimized ResourceColumn component using FlashList for slot backgrounds
 * and shared values for efficient animations.
 * 
 * PARENT REQUIREMENTS for optimal performance:
 * - events: Pass stable reference, ideally pre-filtered for this resource
 * - timeSlots: Pass stable reference (wrap with useMemo)
 * - theme: Pass stable reference (wrap with useMemo)
 * - resource: Pass stable reference (wrap with useMemo)
 * - slotHeight: Keep fixed/constant for best virtualization performance
 * - dragGesture, onEventPress: Pass stable references (wrap with useCallback)
 * 
 * Example parent usage:
 * ```tsx
 * const resources = useMemo(() => [...], [resourceData]);
 * const timeSlots = useMemo(() => generateTimeSlots(), [startHour, endHour]);
 * const theme = useMemo(() => createTheme(), [themeName]);
 * const eventsByResource = useMemo(() => groupEventsByResource(events), [events]);
 * 
 * // Then pass: events={eventsByResource.get(resource.id) || []}
 * ```
 */
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
  dragSelectionOverlayStyle,
}) => {
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => createTimelineStyles(theme), [theme]);
  
  // Memoize theme colors for stable reference
  const themeColors = useMemo(() => ({
    selectionBg: theme.colors.selection.background,
    selectionBorder: theme.colors.selection.border,
    surface: theme.colors.surface,
  }), [theme.colors.selection.background, theme.colors.selection.border, theme.colors.surface]);

  const { getEventPosition, getEventStyling } = useEventPositioning({
    events,
    date,
    startHour,
    hourHeight,
    eventMinHeight,
  });

  // Filter events for this resource - expect parent to pass pre-filtered if possible
  const resourceEvents = useMemo(() => {
    return events.filter(event => event.resourceId === resource.id);
  }, [events, resource.id]);

  // Shared values for efficient animations
  const baseOpacity = useSharedValue(0);
  const selectedSlot = useSharedValue(-1);
  const resourceSelected = useSharedValue(false);

  // Update shared values when props change
  useEffect(() => {
    const timer = setTimeout(() => {
      baseOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isResourceSelected = selectedTimeSlot?.resourceId === resource.id;
    const newSelectedSlot = isResourceSelected ? (selectedTimeSlot?.hourIndex ?? -1) : -1;
    
    // Update shared values directly for immediate animation
    selectedSlot.value = newSelectedSlot;
    resourceSelected.value = isResourceSelected;
  }, [selectedTimeSlot, resource.id]);

  // Precompute slot background data
  const slotsData = useMemo(() => {
    return timeSlots.map((slot, index): SlotBackgroundData => ({
      key: `${slot.hours}-${slot.minutes}-slot`,
      index,
      isWorkingSlot: workingSlots?.isWorking[index] ?? true,
      label: `Time slot ${slot.hours}:${slot.minutes.toString().padStart(2, '0')}`,
    }));
  }, [timeSlots, workingSlots]);

  // Stable FlashList callbacks
  const keyExtractor = useCallback((item: SlotBackgroundData) => item.key, []);

  const renderSlotItem = useCallback(({ item }: { item: SlotBackgroundData }) => (
    <SlotBackground
      item={item}
      slotHeight={slotHeight}
      baseOpacity={baseOpacity}
      selectedSlot={selectedSlot}
      resourceSelected={resourceSelected}
      themeColors={themeColors}
    />
  ), [slotHeight, baseOpacity, selectedSlot, resourceSelected, themeColors]);

  const getItemType = useCallback(() => 'slot', []);

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
          
          {/* Time slot backgrounds using FlashList */}
          <FlashList
            data={slotsData}
            renderItem={renderSlotItem}
            keyExtractor={keyExtractor}
            getItemType={getItemType}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            pointerEvents="none"
          />

          {/* Drag Selection Overlay */}
          <DragSelectionOverlay
            dragSelection={dragSelection}
            slotHeight={slotHeight}
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

/**
 * O(1) comparator for ResourceColumn memoization.
 * 
 * IMPORTANT: This comparator assumes parent provides stable references for:
 * - resource (memoized object)
 * - events (memoized array, ideally pre-filtered per resource)
 * - timeSlots (memoized array)
 * - theme (memoized object)
 * - dragGesture, onEventPress (memoized callbacks)
 * - selectedTimeSlot, dragSelection (stable objects)
 * 
 * The comparator only checks referential equality and scalar values to maintain O(1) performance.
 * Expensive operations like filtering or deep comparisons are avoided to prevent performance bottlenecks.
 */
const arePropsEqual = (prevProps: ResourceColumnProps, nextProps: ResourceColumnProps): boolean => {
  // Check scalar props
  if (prevProps.resourceIndex !== nextProps.resourceIndex ||
      prevProps.width !== nextProps.width ||
      prevProps.slotHeight !== nextProps.slotHeight ||
      prevProps.hourHeight !== nextProps.hourHeight ||
      prevProps.eventMinHeight !== nextProps.eventMinHeight ||
      prevProps.startHour !== nextProps.startHour ||
      prevProps.date !== nextProps.date ||
      prevProps.showWorkingHoursBackground !== nextProps.showWorkingHoursBackground) {
    return false;
  }

  // Check resource object referential equality (parent should memoize)
  if (prevProps.resource !== nextProps.resource) {
    return false;
  }

  // Check referential equality for arrays and objects (O(1))
  if (prevProps.events !== nextProps.events ||
      prevProps.timeSlots !== nextProps.timeSlots ||
      prevProps.theme !== nextProps.theme ||
      prevProps.dragGesture !== nextProps.dragGesture ||
      prevProps.onEventPress !== nextProps.onEventPress ||
      prevProps.workingSlots !== nextProps.workingSlots ||
      prevProps.workingHoursStyle !== nextProps.workingHoursStyle ||
      prevProps.dragSelectionOverlayStyle !== nextProps.dragSelectionOverlayStyle) {
    return false;
  }

  // Check selection state objects
  if (prevProps.selectedTimeSlot !== nextProps.selectedTimeSlot ||
      prevProps.dragSelection !== nextProps.dragSelection) {
    return false;
  }

  return true;
};

ResourceColumnComponent.displayName = 'ResourceColumn';

export default memo(ResourceColumnComponent, arePropsEqual);

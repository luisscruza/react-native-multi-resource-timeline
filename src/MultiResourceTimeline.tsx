import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { CalendarUtils } from 'react-native-calendars';
import {
  GestureDetector,
  GestureHandlerRootView,
  ScrollView as GestureScrollView,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Import our enhanced components and hooks
import {
  HOUR_WIDTH,
  PERFORMANCE
} from './constants';
import { createTimelineStyles } from './styles/timelineStyles';
import { getTheme } from './theme';
import {
  MultiResourceTimelineProps,
  MultiResourceTimelineRef,
  TimelineTheme } from './types';

import { useHapticFeedback } from './hooks/useHapticFeedback';
import { useHorizontalVirtualization } from './hooks/useHorizontalVirtualization';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useScrollSync } from './hooks/useScrollSync';
import { useTimelineCalculations } from './hooks/useTimelineCalculations';
import { useTimelineGestures } from './hooks/useTimelineGestures';
import { useTimelineSelection } from './hooks/useTimelineSelection';
import { useTimelineZoom } from './hooks/useTimelineZoom';
import { useVirtualScroll } from './hooks/useVirtualScroll';
import { useWorkingHours } from './hooks/useWorkingHours';

import TimelineErrorBoundary from './components/ErrorBoundary';
import NowIndicator from './components/NowIndicator';
import ResourceColumn from './components/ResourceColumn';
import ResourceHeader from './components/ResourceHeader';
import SkeletonLoader from './components/SkeletonLoader';
import TimeColumn from './components/TimeColumn';

const { width } = Dimensions.get('window');

const MultiResourceTimeline = forwardRef<MultiResourceTimelineRef, MultiResourceTimelineProps>(({
  events,
  resources,
  date,
  startHour = 0,
  endHour = 24,
  hourHeight = 80,
  eventMinHeight = 40,
  showNowIndicator = false,
  format24h = true,
  timeSlotInterval = 60,
  selectionGranularity,
  resourcesPerPage = 2,
  theme: themeProp = 'light',
  enableHaptics = true,
  showWorkingHoursBackground = false,
  workingHoursStyle,
  clearSelectionAfterDrag = true,
  dragSelectionOverlayStyle,
  onEventPress,
  onTimeSlotSelect,
  onLoadingChange,
  onError,
}, ref) => {
  
  // State management
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVirtualScrollEnabled, setIsVirtualScrollEnabled] = useState(
    // Use optimized thresholds for better performance with multiple columns
    events.length > PERFORMANCE.virtualScrollThresholds.events || 
    (events.length > PERFORMANCE.virtualScrollThresholds.eventsWithMultipleColumns && 
     resources.length > PERFORMANCE.virtualScrollThresholds.columnsThreshold)
  );

  // Theme
  const theme: TimelineTheme = useMemo(() => getTheme(themeProp), [themeProp]);
  const styles = useMemo(() => createTimelineStyles(theme), [theme]);

  // Calculate dynamic column width based on actual displayed resources
  const availableWidth = width - HOUR_WIDTH - 40;
  const actualResourceCount = resources.length;
  const effectiveResourcesPerPage = Math.min(actualResourceCount, resourcesPerPage);
  const dynamicColumnWidth = effectiveResourcesPerPage > 0 ? availableWidth / effectiveResourcesPerPage : availableWidth;

  const {
    currentHourHeight,
    currentEventMinHeight,
    currentColumnWidth,
    handleVerticalZoomChange,
    handleHorizontalZoomChange,
    handleLiveVerticalZoomChange,
    handleLiveHorizontalZoomChange,
    resetZoom,
  } = useTimelineZoom(hourHeight, eventMinHeight, dynamicColumnWidth * 1.1);

  // Enhanced hooks
  const { timeSlots, selectionSlots, slotHeight, selectionHeight, formatTimeSlot, getCurrentTimePosition } = useTimelineCalculations({
    startHour,
    endHour,
    timeSlotInterval,
    selectionGranularity,
    hourHeight: currentHourHeight,
    date,
  });

  const {
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
  } = useTimelineSelection(clearSelectionAfterDrag);

  // Working hours hook
  const { getWorkingHoursForResource, hasWorkingHours } = useWorkingHours(
    resources,
    date,
    startHour,
    endHour,
    timeSlotInterval
  );

  // Haptic feedback
  const {
    lightImpact,
    mediumImpact,
    selectionFeedback,
    successFeedback,
    errorFeedback,
  } = useHapticFeedback({ enabled: enableHaptics });

  // Enhanced gesture handling with haptics
  const handleDragStart = (resourceId: string, slotIndex: number) => {
    lightImpact();
    startDragSelection(resourceId, slotIndex);
  };

  const handleDragUpdate = (endSlot: number) => {
    selectionFeedback();
    updateDragSelection(endSlot);
  };

  const handleDragComplete = () => {
    mediumImpact();
    completeDragSelection(
      (resourceId, startSlot, endSlot) => {
        successFeedback();
        onTimeSlotSelect?.(resourceId, startSlot, endSlot);
      },
      selectionSlots,
      timeSlotInterval,
      startHour
    );
  };

  const {
    pinchHandler,
    scrollGesture,
    createDragGesture,
    isZooming,
  } = useTimelineGestures({
    slotHeight,
    selectionHeight,
    timeSlots,
    selectionSlots,
    resources,
    currentDragSelection,
    startDragSelection: handleDragStart,
    updateDragSelection: handleDragUpdate,
    completeDragSelection: handleDragComplete,
    handleLiveVerticalZoomChange,
    handleLiveHorizontalZoomChange,
    handleVerticalZoomChange,
    handleHorizontalZoomChange,
    disableHorizontalZoom: resources.length === 1,
  });

  // Helper function to convert selection slot indices to time slot indices
  const convertSelectionSlotsToTimeSlots = useCallback((startSlot: number, endSlot: number) => {
    // Get the actual times from selection slots
    const startTime = selectionSlots[startSlot];
    const endTime = selectionSlots[endSlot];
    
    if (!startTime || !endTime) {
      // Fallback to original indices if conversion fails
      return { startSlot, endSlot };
    }
    
    // Convert times to time-slot-based indices 
    const startTimeSlotIndex = timeToTimeSlotIndex(startTime.hours, startTime.minutes, startHour, timeSlotInterval);
    const endTimeSlotIndex = timeToTimeSlotIndex(endTime.hours, endTime.minutes, startHour, timeSlotInterval);
    
    return {
      startSlot: startTimeSlotIndex,
      endSlot: endTimeSlotIndex,
    };
  }, [selectionSlots, startHour, timeSlotInterval]);

  // Helper function to convert time to time-slot-based index
  const timeToTimeSlotIndex = useCallback((hours: number, minutes: number, startHour: number, timeSlotInterval: number) => {
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = startHour * 60;
    const offsetMinutes = totalMinutes - startMinutes;
    
    // Convert to time slot index based on timeSlotInterval
    return Math.floor(offsetMinutes / timeSlotInterval);
  }, []);

  // Keyboard navigation
  const {
    focusedResource,
    focusedTimeSlot,
    handleKeyPress,
    getFocusProps,
    clearSelection: clearKeyboardSelection,
  } = useKeyboardNavigation({
    resources,
    timeSlots: selectionSlots, // Use selection slots for keyboard navigation
    onTimeSlotSelect: (resourceId, startSlot, endSlot) => {
      successFeedback();
      
      // Convert selection slot indices to time slot indices for consistent callback
      const converted = convertSelectionSlotsToTimeSlots(startSlot, endSlot);
      onTimeSlotSelect?.(resourceId, converted.startSlot, converted.endSlot);
    },
    onEventPress,
  });

  // Calculations - moved before usage
  const totalPages = Math.ceil(resources.length / effectiveResourcesPerPage);
  const totalContentWidth = currentColumnWidth * resources.length;
  const scrollViewWidth = width - HOUR_WIDTH - 40;

  // Horizontal scroll tracking for virtualization
  const [scrollX, setScrollX] = useState(0);

  // Virtual scrolling for large datasets
  const containerHeight = (endHour - startHour) * currentHourHeight;
  const { visibleItems: visibleTimeSlots, handleScroll: handleVirtualScroll } = useVirtualScroll({
    itemCount: timeSlots.length,
    itemHeight: slotHeight,
    containerHeight: containerHeight,
    overscan: 5,
  });

  // Horizontal virtualization for better performance with many columns
  const {
    visibleResources,
    startIndex,
    endIndex,
    offsetLeft,
    offsetRight,
    isVirtualized,
  } = useHorizontalVirtualization({
    resources,
    columnWidth: currentColumnWidth,
    scrollViewWidth,
    scrollX,
  });

  // Use virtualized resources for rendering, but keep original for calculations
  const resourcesToRender = isVirtualized ? visibleResources : resources;
  const virtualizedContentWidth = isVirtualized ? 
    visibleResources.length * currentColumnWidth : totalContentWidth;

  const {
    headerScrollRef,
    contentScrollRef,
    handleHeaderScroll,
    handleContentScroll,
    scrollIndicatorOpacity,
    scrollToResource: scrollToResourcePosition,
  } = useScrollSync({
    currentColumnWidth,
    resourcesPerPage: effectiveResourcesPerPage,
    totalPages,
    currentPage,
    setCurrentPage,
    onScrollX: setScrollX,
  });

  // Now indicator
  const nowIndicatorPosition = getCurrentTimePosition();
  const currentTimeString = useMemo(() => {
    if (!showNowIndicator || nowIndicatorPosition === null) return '';
    
    const currentTime = new Date();
    return format24h 
      ? currentTime.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : currentTime.toLocaleTimeString('en-US', { 
          hour12: true, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
  }, [showNowIndicator, nowIndicatorPosition, format24h]);

  // Scroll indicator style
  const scrollIndicatorStyle = useAnimatedStyle(() => ({
    opacity: scrollIndicatorOpacity.value,
  }));

  // Loading progress
  const loadingProgress = useSharedValue(0);

  // Filter events for date
  const filteredEvents = useMemo(() => 
    events.filter(event => 
      CalendarUtils.getCalendarDateString(new Date(event.start)) === date
    ), [events, date]
  );

  // Imperative methods
  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      clearSelection();
      clearKeyboardSelection();
    },
    clearDragSelection: () => {
      clearDragSelection();
    },
    scrollToTime: (hour: number) => {
      const position = (hour - startHour) * currentHourHeight;
      // Implementation would require vertical scroll ref
    },
    scrollToResource: (resourceId: string) => {
      const resourceIndex = resources.findIndex(r => r.id === resourceId);
      if (resourceIndex !== -1) {
        scrollToResourcePosition(resourceIndex);
        lightImpact();
      }
    },
  }), [clearSelection, clearDragSelection, clearKeyboardSelection, startHour, currentHourHeight, resources, scrollToResourcePosition, lightImpact]);

  // Effects with proper cleanup to prevent memory leaks
  useEffect(() => {
    let mounted = true;
    
    loadingProgress.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    
    const timer = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
        onLoadingChange?.(false);
        if (enableHaptics) {
          lightImpact();
        }
      }
    }, 600);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadingProgress, onLoadingChange, enableHaptics, lightImpact]);

  // Update now indicator periodically with cleanup
  useEffect(() => {
    if (!showNowIndicator) return;

    const interval = setInterval(() => {
      getCurrentTimePosition();
    }, 60000);

    return () => clearInterval(interval);
  }, [showNowIndicator, getCurrentTimePosition]);

  // Reset current page when resources change with debouncing to prevent excessive updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
    }, 100);

    return () => clearTimeout(timer);
  }, [resources.length]);

  // Error handling
  useEffect(() => {
    try {
      if (!resources || resources.length === 0) {
        throw new Error('No resources provided');
      }
      if (startHour >= endHour) {
        throw new Error('Start hour must be less than end hour');
      }
    } catch (error) {
      errorFeedback();
      onError?.(error as Error);
    }
  }, [resources, startHour, endHour, onError, errorFeedback]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <SkeletonLoader
        theme={theme}
        resourceCount={Math.min(resources.length, 4)}
        timeSlotCount={Math.min(timeSlots.length, 20)}
        eventCount={Math.min(filteredEvents.length, 8)}
      />
    );
  }

  return (
    <TimelineErrorBoundary theme={theme} onError={onError}>
      <GestureHandlerRootView style={styles.container}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.timeHeaderSpace} />
          <ScrollView 
            ref={headerScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            onScroll={handleHeaderScroll}
            scrollEventThrottle={PERFORMANCE.scrollThrottle}
            bounces={false}
            removeClippedSubviews={true}
            decelerationRate="fast"
            directionalLockEnabled={true}
            style={{ width: scrollViewWidth }}
            contentContainerStyle={{ width: totalContentWidth }}
          >
            <View style={{ flexDirection: 'row', width: totalContentWidth }}>
              {/* Left offset for virtualization */}
              {isVirtualized && offsetLeft > 0 && (
                <View style={{ width: offsetLeft }} />
              )}
              
              {resourcesToRender.map((resource, index) => (
                <ResourceHeader
                  key={resource.id}
                  resource={resource}
                  index={isVirtualized ? startIndex + index : index}
                  width={currentColumnWidth}
                  theme={theme}
                />
              ))}
              
              {/* Right offset for virtualization */}
              {isVirtualized && offsetRight > 0 && (
                <View style={{ width: offsetRight }} />
              )}
            </View>
          </ScrollView>
          
          {/* Horizontal scroll indicator */}
          {totalContentWidth > scrollViewWidth && (
            <Animated.View style={[styles.scrollIndicator, scrollIndicatorStyle]}>
              <View style={styles.scrollThumb} />
            </Animated.View>
          )}
        </View>

        {/* Timeline Content with Pinch Gesture */}
        <PinchGestureHandler onGestureEvent={pinchHandler} shouldCancelWhenOutside={false}>
          <Animated.View style={styles.scrollContainer}>
            <GestureDetector gesture={scrollGesture}>
              <GestureScrollView 
                style={{ flex: 1 }}
                onScroll={isVirtualScrollEnabled ? handleVirtualScroll : undefined}
                scrollEventThrottle={PERFORMANCE.scrollThrottle}
              >
                <View style={styles.timelineContainer}>
                  {/* Time column */}
                  <TimeColumn
                    timeSlots={isVirtualScrollEnabled ? visibleTimeSlots.map(v => timeSlots[v.index]) : timeSlots}
                    slotHeight={slotHeight}
                    formatTimeSlot={formatTimeSlot}
                    timeSlotInterval={timeSlotInterval}
                    format24h={format24h}
                    theme={theme}
                  />
                  
                  {/* Scrollable timeline columns */}
                  <GestureScrollView 
                    ref={contentScrollRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleContentScroll}
                    scrollEventThrottle={PERFORMANCE.scrollThrottle}
                    bounces={false}
                    removeClippedSubviews={true}
                    decelerationRate="fast"
                    directionalLockEnabled={true}
                    style={{ width: scrollViewWidth }}
                    contentContainerStyle={{ width: totalContentWidth }}
                  >
                    <View style={{ flexDirection: 'row', width: totalContentWidth }}>
                      {/* Left offset for virtualization */}
                      {isVirtualized && offsetLeft > 0 && (
                        <View style={{ width: offsetLeft }} />
                      )}
                      
                      {resourcesToRender.map((resource, index) => (
                        <ResourceColumn
                          key={resource.id}
                          resource={resource}
                          resourceIndex={isVirtualized ? startIndex + index : index}
                          events={filteredEvents}
                          timeSlots={isVirtualScrollEnabled ? visibleTimeSlots.map(v => timeSlots[v.index]) : timeSlots}
                          slotHeight={slotHeight}
                          selectionHeight={selectionHeight}
                          width={currentColumnWidth}
                          date={date}
                          startHour={startHour}
                          hourHeight={currentHourHeight}
                          eventMinHeight={currentEventMinHeight}
                          selectedTimeSlot={selectedTimeSlot}
                          dragSelection={dragSelection}
                          dragGesture={createDragGesture(isVirtualized ? startIndex + index : index)}
                          onEventPress={(event) => {
                            lightImpact();
                            onEventPress?.(event);
                          }}
                          theme={theme}
                          showWorkingHoursBackground={showWorkingHoursBackground}
                          workingHoursStyle={workingHoursStyle}
                          workingSlots={getWorkingHoursForResource(resource.id)}
                          dragSelectionOverlayStyle={dragSelectionOverlayStyle}
                        />
                      ))}
                      
                      {/* Right offset for virtualization */}
                      {isVirtualized && offsetRight > 0 && (
                        <View style={{ width: offsetRight }} />
                      )}
                    </View>
                  </GestureScrollView>
                  
                  {/* Now indicator */}
                  {nowIndicatorPosition !== null && currentTimeString && (
                    <NowIndicator
                      position={nowIndicatorPosition}
                      timeString={currentTimeString}
                      scrollViewWidth={scrollViewWidth}
                      theme={theme}
                    />
                  )}
                </View>
              </GestureScrollView>
            </GestureDetector>
          </Animated.View>
        </PinchGestureHandler>
      </GestureHandlerRootView>
    </TimelineErrorBoundary>
  );
});

MultiResourceTimeline.displayName = 'MultiResourceTimeline';

export default MultiResourceTimeline;
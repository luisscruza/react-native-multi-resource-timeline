import React, { memo, useMemo, useCallback } from 'react';
import { Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { createTimelineStyles } from '../styles/timelineStyles';
import { TimelineTheme } from '../types';

interface TimeSlot {
  hours: number;
  minutes: number;
  index: number;
}

interface TimeColumnRow {
  key: string;
  text: string;
  show: boolean;
  a11y: string | undefined;
  hours: number;
  minutes: number;
}

interface TimeColumnProps {
  timeSlots: TimeSlot[];
  slotHeight: number;
  formatTimeSlot: (hours: number, minutes: number, format24h?: boolean, showMinutes?: boolean) => string;
  timeSlotInterval: number;
  format24h: boolean;
  theme: TimelineTheme;
}

/**
 * Optimized TimeColumn component using FlashList for virtualization.
 * 
 * PARENT REQUIREMENTS for optimal performance:
 * - timeSlots: Pass stable reference (wrap with useMemo)
 * - formatTimeSlot: Pass stable reference (wrap with useCallback)
 * - theme: Pass stable reference (wrap with useMemo)
 * - slotHeight: Keep fixed/constant for best virtualization performance
 * 
 * Example parent usage:
 * ```tsx
 * const timeSlots = useMemo(() => generateTimeSlots(), [startHour, endHour, interval]);
 * const formatTimeSlot = useCallback((h, m, f24, sm) => { ... }, []);
 * const theme = useMemo(() => createTheme(), [themeName]);
 * ```
 */
const TimeColumn = memo<TimeColumnProps>(({ 
  timeSlots, 
  slotHeight, 
  formatTimeSlot, 
  timeSlotInterval,
  format24h,
  theme 
}) => {
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => createTimelineStyles(theme), [theme]);

  // Precompute rows data with memoization
  const rows = useMemo(() => {
    return timeSlots.map((slot): TimeColumnRow => {
      // Only show time labels for hour boundaries or every 30/15 minutes based on interval
      const shouldShowLabel = slot.minutes === 0 || 
        (timeSlotInterval <= 30 && slot.minutes % 30 === 0) ||
        (timeSlotInterval <= 15 && slot.minutes % 15 === 0);
      
      let timeText = '';
      if (shouldShowLabel) {
        const formattedTime = formatTimeSlot(slot.hours, slot.minutes, format24h, slot.minutes > 0);
        // Use indexOf to find space and build two-line text efficiently
        const spaceIndex = formattedTime.indexOf(' ');
        timeText = spaceIndex > -1 
          ? formattedTime.substring(0, spaceIndex) + '\n' + formattedTime.substring(spaceIndex + 1)
          : formattedTime;
        timeText = timeText.toLowerCase();
      }
      
      return {
        key: `${slot.hours}-${slot.minutes}`,
        text: timeText,
        show: shouldShowLabel,
        a11y: shouldShowLabel ? `Time ${formatTimeSlot(slot.hours, slot.minutes, format24h)}` : undefined,
        hours: slot.hours,
        minutes: slot.minutes,
      };
    });
  }, [timeSlots, timeSlotInterval, formatTimeSlot, format24h]);

  // Stable key extractor
  const keyExtractor = useCallback((row: TimeColumnRow) => row.key, []);

  // Stable render item
  const renderItem = useCallback(({ item }: { item: TimeColumnRow }) => (
    <View 
      style={[
        styles.timeSlot, 
        { height: slotHeight }
      ]}
      accessibilityRole="text"
      accessibilityLabel={item.a11y}
    >
      <Text style={[styles.timeText, { 
        opacity: item.show ? 1 : 0,
        color: theme.colors.text.secondary 
      }]}>
        {item.text}
      </Text>
    </View>
  ), [styles.timeSlot, styles.timeText, slotHeight, theme.colors.text.secondary]);

  // Single item type for homogeneous list
  const getItemType = useCallback(() => 'row', []);

  return (
    <View style={styles.timeColumn}>
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
});

/**
 * O(1) comparator for TimeColumn memoization.
 * 
 * IMPORTANT: This comparator assumes parent provides stable references for:
 * - timeSlots (memoized array)
 * - formatTimeSlot (memoized callback)
 * - theme (memoized object)
 * 
 * The comparator only checks referential equality and scalar values to maintain O(1) performance.
 * Deep comparisons or filtering are avoided to prevent performance bottlenecks.
 */
const arePropsEqual = (prevProps: TimeColumnProps, nextProps: TimeColumnProps): boolean => {
  // Check scalar props
  if (prevProps.slotHeight !== nextProps.slotHeight ||
      prevProps.timeSlotInterval !== nextProps.timeSlotInterval ||
      prevProps.format24h !== nextProps.format24h) {
    return false;
  }

  // Check referential equality for arrays and functions (O(1))
  if (prevProps.timeSlots !== nextProps.timeSlots ||
      prevProps.formatTimeSlot !== nextProps.formatTimeSlot ||
      prevProps.theme !== nextProps.theme) {
    return false;
  }

  return true;
};

TimeColumn.displayName = 'TimeColumn';

export default memo(TimeColumn, arePropsEqual);

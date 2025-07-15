import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { createTimelineStyles } from '../styles/timelineStyles';
import { TimelineTheme } from '../types';

interface TimeSlot {
  hours: number;
  minutes: number;
  index: number;
}

interface TimeColumnProps {
  timeSlots: TimeSlot[];
  slotHeight: number;
  formatTimeSlot: (hours: number, minutes: number, format24h?: boolean, showMinutes?: boolean) => string;
  timeSlotInterval: number;
  format24h: boolean;
  theme: TimelineTheme;
}

const TimeColumn = memo<TimeColumnProps>(({ 
  timeSlots, 
  slotHeight, 
  formatTimeSlot, 
  timeSlotInterval,
  format24h,
  theme 
}) => {
  const styles = createTimelineStyles(theme);

  return (
    <View style={styles.timeColumn}>
      {timeSlots.map((slot, index) => {
        // Only show time labels for hour boundaries or every 30 minutes if interval is 30 or less
        const shouldShowLabel = slot.minutes === 0 || 
          (timeSlotInterval <= 30 && slot.minutes % 30 === 0) ||
          (timeSlotInterval <= 15 && slot.minutes % 15 === 0);
        
        const timeText = shouldShowLabel 
          ? formatTimeSlot(slot.hours, slot.minutes, format24h, slot.minutes > 0)
              .replace(' ', '\n')
              .toLowerCase()
          : '';
        
        return (
          <View 
            key={`${slot.hours}-${slot.minutes}`} 
            style={[
              styles.timeSlot, 
              { height: slotHeight }
            ]}
            accessibilityRole="text"
            accessibilityLabel={shouldShowLabel ? `Time ${formatTimeSlot(slot.hours, slot.minutes, format24h)}` : undefined}
          >
            <Text style={[styles.timeText, { 
              opacity: shouldShowLabel ? 1 : 0,
              color: theme.colors.text.secondary 
            }]}>
              {timeText}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

TimeColumn.displayName = 'TimeColumn';

export default TimeColumn;

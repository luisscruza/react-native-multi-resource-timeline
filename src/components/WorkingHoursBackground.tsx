import React, { memo } from 'react';
import { View } from 'react-native';
import { TimelineTheme, WorkingHoursStyle } from '../types';
import { WorkingSlots } from '../utils/workingHoursParser';

interface WorkingHoursBackgroundProps {
  workingSlots?: WorkingSlots;
  slotHeight: number;
  theme: TimelineTheme;
  style?: WorkingHoursStyle;
  width: number;
  totalSlots: number;
}

const WorkingHoursBackground = memo<WorkingHoursBackgroundProps>(({
  workingSlots,
  slotHeight,
  theme,
  style,
  width,
  totalSlots
}) => {
  const { isWorking } = workingSlots || { isWorking: [] };
  
  // If no working slots defined, create array with all non-working slots
  const slots = isWorking.length > 0 ? isWorking : new Array(totalSlots).fill(false);

  // Use custom style or fallback to theme
  const workingBackground = style?.workingBackground || theme.colors.workingHours.working;
  const nonWorkingBackground = style?.nonWorkingBackground || '#8E8E8E';

  return (
    <View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width,
      }}
      pointerEvents="none" // Allow touches to pass through
    >
      {/* Render working/non-working slots */}
      {slots.map((working, slotIndex) => {
        if (working) {
          // Working hours - subtle green background
          return (
            <View
              key={`working-slot-${slotIndex}`}
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                top: slotIndex * slotHeight,
                height: slotHeight,
                backgroundColor: workingBackground,
                opacity: style?.workingOpacity || 0.2,
              }}
            />
          );
        } else {
          // Non-working hours - use custom style or fallback
          return (
            <View
              key={`non-working-slot-${slotIndex}`}
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                top: slotIndex * slotHeight,
                height: slotHeight,
                backgroundColor: nonWorkingBackground,
                opacity: style?.nonWorkingOpacity || 0.12,
                borderBottomWidth: 1,
                  borderBottomColor: '#ccc', // or your preferred color
              }}
            />
          );
        }
      })}
    </View>
  );
});

WorkingHoursBackground.displayName = 'WorkingHoursBackground';

export default WorkingHoursBackground;

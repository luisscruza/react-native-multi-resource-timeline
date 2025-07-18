import { useCallback, useMemo } from 'react';

interface TimeSlot {
  hours: number;
  minutes: number;
  index: number;
}

interface UseTimelineCalculationsProps {
  startHour: number;
  endHour: number;
  timeSlotInterval: number;
  hourHeight: number;
  date: string;
}

// Simple date utility functions to replace CalendarUtils
const getCalendarDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const useTimelineCalculations = ({
  startHour,
  endHour,
  timeSlotInterval,
  hourHeight,
  date,
}: UseTimelineCalculationsProps) => {
  // Memoized calculations
  const timeSlots = useMemo(() => {
    const slotsPerHour = 60 / timeSlotInterval;
    const totalSlots = (endHour - startHour) * slotsPerHour;
    
    return Array.from({ length: totalSlots }, (_, i) => {
      const totalMinutes = startHour * 60 + i * timeSlotInterval;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return { hours, minutes, index: i };
    });
  }, [startHour, endHour, timeSlotInterval]);

  const slotHeight = useMemo(() => {
    return hourHeight / (60 / timeSlotInterval);
  }, [hourHeight, timeSlotInterval]);

  const formatTimeSlot = useCallback((hours: number, minutes: number, format24h: boolean = true, showMinutes: boolean = true) => {
    if (format24h) {
      return showMinutes 
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        : `${hours.toString().padStart(2, '0')}:00`;
    } else {
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? 'PM' : 'AM';
      return showMinutes && minutes > 0
        ? `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
        : `${displayHour}:00 ${period}`;
    }
  }, []);

  const getCurrentTimePosition = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    const today = getCalendarDateString(now);
    const isToday = date === today;
    const isWithinRange = currentHour >= startHour && currentHour <= endHour;
    
    if (!isToday || !isWithinRange) {
      return null;
    }
    
    return (currentHour - startHour) * hourHeight;
  }, [date, startHour, endHour, hourHeight]);

  return {
    timeSlots,
    slotHeight,
    formatTimeSlot,
    getCurrentTimePosition,
  };
};

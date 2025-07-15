/**
 * Working Hours Parser Utility
 * 
 * Parses working hours time ranges and converts them to slot indices
 * for timeline visualization.
 */

export interface TimeRange {
  start: string; // "HH:MM" format
  end: string;   // "HH:MM" format
}

export interface WorkingSlots {
  isWorking: boolean[];
  workingRanges: { start: number; end: number }[];
}

/**
 * Converts time string to minutes since midnight
 * @param timeStr Time in "HH:MM" format
 * @returns Minutes since midnight
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts minutes to slot index based on timeline configuration
 * @param minutes Minutes since midnight
 * @param startHour Timeline start hour
 * @param timeSlotInterval Interval between slots in minutes
 * @returns Slot index
 */
export const minutesToSlotIndex = (
  minutes: number,
  startHour: number,
  timeSlotInterval: number
): number => {
  const startMinutes = startHour * 60;
  const relativeMinutes = minutes - startMinutes;
  return Math.floor(relativeMinutes / timeSlotInterval);
};

/**
 * Parses time range string to start and end times
 * @param range Time range in "HH:MM-HH:MM" format
 * @returns Object with start and end times
 */
export const parseTimeRange = (range: string): TimeRange => {
  const [start, end] = range.split('-');
  return { start: start.trim(), end: end.trim() };
};

/**
 * Converts working hours time ranges to slot indices
 * @param timeRanges Array of time ranges in "HH:MM-HH:MM" format
 * @param startHour Timeline start hour
 * @param endHour Timeline end hour
 * @param timeSlotInterval Interval between slots in minutes
 * @returns Array of working slot indices and working ranges
 */
export const parseWorkingHours = (
  timeRanges: string[],
  startHour: number,
  endHour: number,
  timeSlotInterval: number
): WorkingSlots => {
  const totalSlots = ((endHour - startHour) * 60) / timeSlotInterval;
  const isWorking = new Array(totalSlots).fill(false);
  const workingRanges: { start: number; end: number }[] = [];

  timeRanges.forEach(range => {
    try {
      const { start, end } = parseTimeRange(range);
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);
      
      const startSlot = minutesToSlotIndex(startMinutes, startHour, timeSlotInterval);
      const endSlot = minutesToSlotIndex(endMinutes, startHour, timeSlotInterval);
      
      // Mark slots as working (ensure we don't go out of bounds)
      const clampedStartSlot = Math.max(0, startSlot);
      const clampedEndSlot = Math.min(totalSlots - 1, endSlot);
      
      for (let i = clampedStartSlot; i <= clampedEndSlot; i++) {
        isWorking[i] = true;
      }
      
      // Store the working range for background rendering
      if (clampedStartSlot <= clampedEndSlot) {
        workingRanges.push({
          start: clampedStartSlot,
          end: clampedEndSlot
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.warn(`Failed to parse working hours range: ${range}`, error);
      }
    }
  });

  return { isWorking, workingRanges };
};

/**
 * Gets working hours for a specific resource and date
 * @param resource Resource with working hours
 * @param date Date in YYYY-MM-DD format
 * @param startHour Timeline start hour
 * @param endHour Timeline end hour
 * @param timeSlotInterval Interval between slots in minutes
 * @returns Working slots information
 */
export const getResourceWorkingHours = (
  resource: { workingHours?: { [date: string]: string[] } },
  date: string,
  startHour: number,
  endHour: number,
  timeSlotInterval: number
): WorkingSlots => {
  if (!resource.workingHours || !resource.workingHours[date]) {
    // No working hours defined - treat all time as non-working
    const totalSlots = ((endHour - startHour) * 60) / timeSlotInterval;
    return {
      isWorking: new Array(totalSlots).fill(false),
      workingRanges: []
    };
  }

  return parseWorkingHours(
    resource.workingHours[date],
    startHour,
    endHour,
    timeSlotInterval
  );
};
